import { postToBluesky as post } from '~/infrastructures/BlueskyRepository'
import type { SNSPoster } from '~/interfaces/SNSPoster'
import type { Post } from '~/models/Post'
import type { Preference } from '~/models/Preference'

export class BlueskyPoster implements SNSPoster {
    async post(postData: Post, pref: Preference): Promise<string> {
        return await post(postData, pref)
    }
}
