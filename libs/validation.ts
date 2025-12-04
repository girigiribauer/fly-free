import type { Draft } from '~/models/Draft'
import type { Preference } from '~/models/Preference'
import type { PostValidateState } from '~/models/PostValidateState'
import type { SocialMedia } from '~/models/SocialMedia'
import { blueskyValidationRule } from '~/infrastructures/BlueskyValidationRule'
import { twitterValidationRule } from '~/infrastructures/TwitterValidationRule'

/**
 * Draft と Preference から各SNSの Validation 結果を計算する
 *
 * @pure この関数は純粋関数であり、副作用を持たない
 * @param draft - 投稿内容
 * @param pref - ユーザー設定
 * @returns 各SNSの Validation 結果
 *
 * @example
 * const results = computeValidationResults(draft, pref)
 * if (results.Twitter.type === 'Valid') {
 *   // Twitter に投稿可能
 * }
 */
export const computeValidationResults = (
    draft: Draft | null,
    pref: Preference,
): Record<SocialMedia, PostValidateState> => {
    return {
        Twitter: twitterValidationRule.validate(draft, pref),
        Bluesky: blueskyValidationRule.validate(draft, pref),
    }
}
