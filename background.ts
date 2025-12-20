
import type { Draft } from '~/models/Draft'
import { convertDraft2Post } from '~/services/PostService'
import type { ProcessMessage } from '~/models/ProcessMessage'
import { load } from '~/stores/PreferenceStore'
import { DeliveryService } from '~/services/DeliveryService'

import { StorageIdentifier } from '~/definitions'
import { getTwitterIntentURL } from '~/libs/TwitterURLBuilder'


const monitoringTabs = new Set<number>()

chrome.action.onClicked.addListener(async (tab: chrome.tabs.Tab) => {
  const pref = await load()
  const isForceBlank = pref.globalForceblank
  const url = getTwitterIntentURL(tab.title, tab.url, isForceBlank)

  const win = await chrome.windows.create({
    url,
    type: 'popup',
    width: 600,
    height: 400,
  })

  // Track the tab ID of the created popup window
  if (win.tabs && win.tabs.length > 0) {
    const tabId = win.tabs[0].id
    if (tabId) {
      console.log(`[DEBUG-BG] Tracking tab ${tabId} for auto-close on redirect`)
      monitoringTabs.add(tabId)
    }
  }
})

// Monitor for redirection to home (Success case)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!monitoringTabs.has(tabId)) return
  if (changeInfo.status !== 'loading' || !changeInfo.url) return

  const url = changeInfo.url
  if (
    url.includes('twitter.com/home') ||
    url.includes('x.com/home')
  ) {
    console.log(`[DEBUG-BG] Detected redirect to Home (Success) for tab ${tabId}.`)

    // IMPORTANT: Update Storage directly since Content Script is dead on /home
    // This ensures that "Success" is recorded for restoration.
    const storageKey = `${StorageIdentifier}_Temporary`
    chrome.storage.local.get([storageKey]).then((result) => {
      const delivery = result[storageKey]
      if (delivery && delivery.recipients) {
        let updated = false
        const newRecipients = delivery.recipients.map((r: any) => {
          if (r.recipient === 'Twitter' && r.type !== 'Success') {
            updated = true
            return { ...r, type: 'Success', url: url, error: undefined }
          }
          return r
        })

        if (updated) {
          // Check if all recipients are finished (Success/Error)
          const allFinished = newRecipients.every((r: any) =>
            r.type === 'Success' || r.type === 'Error'
          )

          if (allFinished) {
            console.log('[DEBUG-BG] Delivery complete. Clearing temporary storage immediately.')
            chrome.storage.local.remove(storageKey)
          } else {
            console.log('[DEBUG-BG] Updating storage to mark Twitter as Success')
            delivery.recipients = newRecipients
            chrome.storage.local.set({ [storageKey]: delivery })
          }
        }
      }
    })

    // Notify UI of success (In case Content Script survived via SPA navigation)
    chrome.tabs.sendMessage(tabId, {
      type: 'Success',
      recipient: 'Twitter',
      url: url
    }).catch(() => {
      // Ignore if tab is dead or content script unloaded
    })

    // We stop monitoring this tab since the "post" action is effectively done
    monitoringTabs.delete(tabId)
  }
})

// Cleanup tracked tabs if closed manually
chrome.tabs.onRemoved.addListener((tabId) => {
  if (monitoringTabs.has(tabId)) {
    monitoringTabs.delete(tabId)
  }
})

const PROCESSING_TIME_WINDOW = 2000 // 2 seconds
let lastProcessedTime = 0

chrome.runtime.onMessage.addListener(async (request, sender) => {
  const receivedMessage = request as ProcessMessage
  if (!receivedMessage) return
  console.log('[DEBUG-BG] Received message:', receivedMessage)

  if (receivedMessage.type === 'CloseWindow') {
    if (sender.tab?.id) {
      chrome.tabs.remove(sender.tab.id)
    }
    return
  }

  if (receivedMessage.type === 'Log') {
    console.log('[DEBUG-UI]', receivedMessage.payload)
    return
  }

  if (receivedMessage.type !== 'Post') return

  // GUARD: Prevent double processing with Mutual Exclusion (Web Locks + Storage)
  // 1. Use navigator.locks to prevent race condition between duplicate listeners reading storage simultaneously
  // 2. Use chrome.storage.session to share state across HMR zombie contexts

  // Wait, I need to restructure to return boolean from lock
  const shouldProceed = await navigator.locks.request('flyfree_post_lock', async () => {
    const now = Date.now()
    const storageKey = 'lastProcessedTime'
    const sessionData = await chrome.storage.session.get(storageKey)
    const lastTime = sessionData[storageKey] || 0

    if (now - lastTime < PROCESSING_TIME_WINDOW) {
      console.log('[DEBUG-BG] Lock check: THROTTLED (return false)')
      return false
    }

    await chrome.storage.session.set({ [storageKey]: now })
    return true
  })

  if (!shouldProceed) {
    console.warn('Duplicate post request ignored (Throttled via Lock+Storage)')
    console.log('[DEBUG-BG] shouldProceed is false. STOP.')
    return
  }

  console.log('[DEBUG-BG] Proceeding with delivery...')

  const { draft, recipients } = receivedMessage
  const tabID = sender.tab.id
  const draftObj: Draft = JSON.parse(draft)
  const postData = await convertDraft2Post(draftObj)
  const pref = await load()

  const service = new DeliveryService()
  await service.deliver(postData, recipients, pref, tabID)
})
