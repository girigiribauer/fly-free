import * as Promise from 'bluebird'

import type { Draft } from '~/models/Draft'
import { convertDraft2Post, type Post } from '~/models/Post'
import type { PostMessageState } from '~/models/PostMessageState'
import type { Preference } from '~/models/Preference'
import type { ProcessMessage } from '~/models/ProcessMessage'
import { load } from '~/models/Store'
import { postToBluesky } from '~/infrastructures/BlueskyRepository'

const TwitterTweetURL = 'https://twitter.com/intent/post'

const getURLWithQuery = (
  origin: string,
  text: string | undefined,
  url: string | undefined,
  isForceBlank: boolean,
) => {
  const urlParams = new URLSearchParams({
    ff: '1',
  })

  if (isForceBlank) {
    return `${origin}?${urlParams}`
  }

  if (text) {
    urlParams.append('text', text)
  }
  if (url) {
    urlParams.append('url', url)
  }

  return `${origin}?${urlParams}`
}

chrome.action.onClicked.addListener(async (tab: chrome.tabs.Tab) => {
  const pref = await load()
  const isForceBlank = pref.globalForceblank
  const url = getURLWithQuery(TwitterTweetURL, tab.title, tab.url, isForceBlank)

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

  await Promise.mapSeries(
    recipients.filter(({ recipient }) => recipient !== 'Twitter'),
    async ({ recipient }: PostMessageState) => {
      let post: (post: Post, pref: Preference) => Promise<string>

      switch (recipient) {
        case 'Bluesky':
          post = postToBluesky
          break
        default:
          throw new Error(`Unknown recipient: ${recipient}`)
      }

      const result: string | Error = await post(postData, pref).catch(
        (error: Error) => {
          return error
        },
      )

      let message: ProcessMessage
      if (result instanceof Error) {
        message = {
          type: 'Error',
          recipient,
          error: result.message,
        }
      } else {
        message = {
          type: 'Success',
          recipient,
          url: result,
        }
      }
      await chrome.tabs.sendMessage(tabID, message)
    },
  )

  if (recipients.some(({ recipient }) => recipient === 'Twitter')) {
    const twitterMessage: ProcessMessage = {
      type: 'Tweet',
    }
    await chrome.tabs.sendMessage(tabID, twitterMessage)
  }

  chrome.runtime.onMessage.removeListener(() => { })
})
