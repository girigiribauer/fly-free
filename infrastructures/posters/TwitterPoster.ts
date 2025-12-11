import type { SNSPoster } from '~/interfaces/SNSPoster'
import type { Post } from '~/models/Post'
import type { Preference } from '~/models/Preference'

import type { ProcessMessage } from '~/models/ProcessMessage'

export class TwitterPoster implements SNSPoster {
    constructor(private tabID: number) { }

    async post(postData: Post, pref: Preference): Promise<string> {
        const twitterMessage: ProcessMessage = {
            type: 'Tweet',
        }

        try {
            await chrome.tabs.sendMessage(this.tabID, twitterMessage)
            return 'Twitter UI Triggered'
        } catch (error) {
            console.error('Failed to trigger Twitter UI:', error)
            throw new Error('Failed to send message to Twitter tab')
        }
    }
}
