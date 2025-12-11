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
        console.log('[DEBUG-BG] DeliveryService.deliver called', { recipientsString: JSON.stringify(recipients) })
        // X(Twitter) は必ず最後に投稿する
        const sortedRecipients = [...recipients].sort((a, b) => {
            if (a.recipient === 'Twitter') return 1
            if (b.recipient === 'Twitter') return -1
            return 0
        })

        await Promise.mapSeries(
            sortedRecipients,
            async ({ recipient }: PostMessageState) => {
                let poster: SNSPoster

                switch (recipient) {
                    case 'Bluesky':
                        poster = new BlueskyPoster()
                        break
                    case 'Twitter':
                        poster = new TwitterPoster(tabID)
                        break
                    default:
                        console.warn(`Unknown recipient: ${recipient}`)
                        return
                }

                // API型(Bluesky)は投稿実行、UI型(Twitter)はUI操作トリガーメッセージを送信
                let result: string | Error
                try {
                    result = await poster.post(post, pref)
                    console.log(`[DEBUG-BG] Post result for ${recipient}:`, result)
                } catch (error) {
                    console.error(`[DEBUG-BG] Error posting to ${recipient}:`, error)
                    result = error as Error
                }

                // Twitterの場合はここで終了
                // (TwitterPoster.post がUIトリガーメッセージを既に送信しており、
                //  その後の成功判定などのフローはContent Script側で完結するため)
                if (recipient === 'Twitter') return

                // API型の場合は、結果(成功/失敗)をContent Scriptへ通知する
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
