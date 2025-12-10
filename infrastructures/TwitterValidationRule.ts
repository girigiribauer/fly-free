import twitter from 'twitter-text'

import type { Draft } from '~/models/Draft'
import type { PostValidateState } from '~/models/PostValidateState'
import type { Preference } from '~/models/Preference'
import type { PostValidationRule } from '~/models/PostValidationRule'

export const twitterValidationRule: PostValidationRule = {
    validate(draft: Draft | undefined, pref: Preference): PostValidateState {
        if (!draft) {
            return {
                type: 'Invalid',
                errors: [{ type: 'NoDraft' }],
            }
        }

        const { text, imageURLs } = draft

        if (!text || text.length === 0) {
            const hasNoImage = !imageURLs || imageURLs.length === 0
            if (hasNoImage) {
                return {
                    type: 'Invalid',
                    errors: [{ type: 'NoText' }],
                }
            } else {
                return {
                    type: 'Valid',
                }
            }
        }

        const { valid } = twitter.parseTweet(text)
        if (!valid) {
            return {
                type: 'Invalid',
                errors: [{ type: 'ParseInvalid' }],
            }
        }

        return {
            type: 'Valid',
        }
    }
}
