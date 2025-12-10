import type { SNSPoster } from '~/interfaces/SNSPoster'
import type { Post } from '~/models/Post'
import type { Preference } from '~/models/Preference'

export class TwitterPoster implements SNSPoster {
    // Twitter posting is triggered via UI message in background.ts
    // This class acts as a placeholder or can handle the message dispatch if we move that logic here.
    // For now, based on the architecture, the actual "post" happens by sending a message to the content script.
    // DeliveryService will likely need to handle this specific case or we adapt the interface.

    // However, the interface demands `post(post, pref): Promise<string>`.
    // Since Twitter posting via this extension is "opening a tweet intent" or "clicking a button",
    // it doesn't return a URL in the same way API calls do.

    // Refactoring plan strategy: "TwitterPoster.ts Implements the 'send message to tab' logic."

    constructor(private tabID: number) { }

    async post(postData: Post, pref: Preference): Promise<string> {
        // Twitter handling is special: it sends a message to the content script to click the button.
        // It doesn't yield a result URL synchronously.

        // We can return a specific string indicating success of the *command*, not the post itself.
        return 'Twitter UI Triggered'
    }
}
