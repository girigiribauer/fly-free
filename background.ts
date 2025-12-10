
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

chrome.runtime.onMessage.addListener(async (request, sender) => {
  const receivedMessage = request as ProcessMessage
  if (!receivedMessage) return

  if (receivedMessage.type === 'CloseWindow') {
    if (sender.tab?.id) {
      chrome.tabs.remove(sender.tab.id)
    }
    return
  }

  if (receivedMessage.type !== 'Post') return

  const { draft, recipients } = receivedMessage
  const tabID = sender.tab.id
  const draftObj: Draft = JSON.parse(draft)
  const postData = await convertDraft2Post(draftObj)
  const pref = await load()

  const service = new DeliveryService()
  await service.deliver(postData, recipients, pref, tabID)

  chrome.runtime.onMessage.removeListener(() => { })
})
