import type { Draft } from '~/models/Draft'
import type { Preference } from '~/models/Preference'
import type { PostValidateState } from '~/models/PostValidateState'

/**
 * Interface for SNS-specific post validation rules.
 * Each SNS implementation should validate according to its platform constraints.
 */
export interface PostValidationRule {
    /**
     * Validates a draft post according to SNS-specific rules.
     * @param draft - The draft content to validate
     * @param pref - User preferences (may contain credentials)
     * @returns Validation result indicating if the post is valid
     */
    validate(draft: Draft | undefined, pref: Preference): PostValidateState
}
