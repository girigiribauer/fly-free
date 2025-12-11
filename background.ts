
import type { Draft } from '~/models/Draft'
import { convertDraft2Post } from '~/services/PostService'
import type { ProcessMessage } from '~/models/ProcessMessage'
import { load } from '~/stores/PreferenceStore'
import { DeliveryService } from '~/services/DeliveryService'

import { getTwitterIntentURL } from '~/libs/TwitterURLBuilder'

chrome.action.onClicked.addListener(async (tab: chrome.tabs.Tab) => {
  const pref = await load()
  const isForceBlank = pref.globalForceblank
  const url = getTwitterIntentURL(tab.title, tab.url, isForceBlank)

  await chrome.windows.create({
    url,
    type: 'popup',
    width: 600,
    height: 400,
  })
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
