import type { Draft } from '~/models/Draft'
import type { PostValidateState } from '~/models/PostValidateState'
import type { Preference } from '~/models/Preference'
import type { PostValidationRule } from '~/models/PostValidationRule'

export const blueskyValidationRule: PostValidationRule = {
    validate(draft: Draft | undefined, pref: Preference): PostValidateState {
        if (!draft) {
            return {
                type: 'Invalid',
                errors: [{ type: 'NoDraft' }],
            }
        }
        if (pref.blueskyUsername === '' || pref.blueskyPassword === '') {
            return {
                type: 'Invalid',
                errors: [{ type: 'NoCredentials' }],
            }
        }

        const { text, imageURLs } = draft
        if ((!text || text.length === 0) && (!imageURLs || imageURLs.length === 0)) {
            return {
                type: 'Invalid',
                errors: [{ type: 'NoText' }],
            }
        }
        if (text.length > 300) {
            return {
                type: 'Invalid',
                errors: [{ type: 'TextTooLong', maxLength: 300 }],
            }
        }
        // TODO: case embedded video

        return {
            type: 'Valid',
        }
    }
}
