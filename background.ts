import * as Promise from 'bluebird'

import type { Draft } from '~/models/Draft'
import { convertDraft2Post, type Post } from '~/models/Post'
import type { Preference } from '~/models/Preference'
import type { ProcessMessage } from '~/models/ProcessMessage'
import { load } from '~/models/Store'
import { post as postBluesky } from '~/services/Bluesky'
import type { PostMessageState } from '~models/PostMessageState'

const TwitterTweetURL = 'https://twitter.com/intent/tweet'

chrome.action.onClicked.addListener(async (tab: chrome.tabs.Tab) => {
  const getWindowURL = (
    origin: string,
    text: string | undefined,
    url: string | undefined,
  ) => {
    if (!text || !url) return origin

    const urlParams = new URLSearchParams({
      text,
      url,
    })
    return `${origin}?${urlParams}`
  }

  const url = getWindowURL(TwitterTweetURL, tab.title, tab.url)

  await chrome.windows.create({
    url,
    type: 'popup',
    width: 600,
    height: 400,
  })
})

chrome.runtime.onMessage.addListener(async (request, sender) => {
  const receivedMessage = request as ProcessMessage
  if (!receivedMessage || receivedMessage.type !== 'Post') return

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
          post = postBluesky
          break
        case 'Taittsuu':
          // TODO: after Taittsuu API
          throw new Error('unimplemented')
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

  chrome.runtime.onMessage.removeListener(() => {})
})
