import * as Promise from 'bluebird'

import { BlueskyPoster } from '~/infrastructures/posters/BlueskyPoster'
import { TwitterPoster } from '~/infrastructures/posters/TwitterPoster'
import type { SNSPoster } from '~/interfaces/SNSPoster'
import type { Post } from '~/models/Post'
import type { PostMessageState } from '~/models/PostMessageState'
import type { Preference } from '~/models/Preference'
import type { ProcessMessage } from '~/models/ProcessMessage'

export class DeliveryService {
    async deliver(
        post: Post,
        recipients: PostMessageState[],
        pref: Preference,
        tabID: number,
    ): Promise<void> {
        // Sort recipients: API-based first, UI interactions (Twitter) last
        // This sorting logic was previously implicit/manual in background.ts
        const sortedRecipients = [...recipients].sort((a, b) => {
            if (a.recipient === 'Twitter') return 1
            if (b.recipient === 'Twitter') return -1
            return 0
        })

        await Promise.mapSeries(
            sortedRecipients,
            async ({ recipient }: PostMessageState) => {
                let poster: SNSPoster
                let isAPIPost = true

                switch (recipient) {
                    case 'Bluesky':
                        poster = new BlueskyPoster()
                        break
                    case 'Twitter':
                        poster = new TwitterPoster(tabID)
                        isAPIPost = false
                        break
                    default:
                        console.warn(`Unknown recipient: ${recipient}`)
                        return
                }

                if (!isAPIPost) {
                    // Twitter special handling: just send the message to trigger UI
                    // The infrastructure/TwitterPoster could handle the messaging details too,
                    // but sticking to the plan where DeliveryService manages the loop and feedback.
                    // Actually, TwitterPoster implementation I wrote just returns string.
                    // So we need to do the messaging here or inside TwitterPoster.

                    // Let's rely on TwitterPoster to handle the "Action" conceptually,
                    // but since TwitterPoster just checks nothing, we need to send the message here
                    // OR move the messaging logic into TwitterPoster.

                    // For now, let's keep the messaging logic here for Twitter as it was in background.ts
                    // "if (recipients.some ... Twitter) ... chrome.tabs.sendMessage"

                    const twitterMessage: ProcessMessage = {
                        type: 'Tweet',
                    }
                    await chrome.tabs.sendMessage(tabID, twitterMessage)
                    return
                }

                // For API based posters
                const result: string | Error = await poster.post(post, pref).catch(
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
    }
}
