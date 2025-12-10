import type { Post } from '~/models/Post'
import type { Preference } from '~/models/Preference'

export interface SNSPoster {
    post(post: Post, pref: Preference): Promise<string>
}
