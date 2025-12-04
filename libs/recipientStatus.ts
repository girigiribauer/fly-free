import type { RecipientState } from '~/models/RecipientState'
import type { PostingStatus } from '~/models/PostingStatus'
import type { SocialMedia } from '~/models/SocialMedia'
import type { PostValidateState } from '~/models/PostValidateState'

/**
 * Recipients の配列から全体の PostingStatus を導出する
 *
 * @pure この関数は純粋関数であり、副作用を持たない
 * @param recipients - Recipients の配列
 * @returns 全体の PostingStatus
 *
 * @example
 * const status = derivePostingStatus([
 *   { type: 'Posting', recipient: 'Twitter' },
 *   { type: 'Success', recipient: 'Bluesky', url: '...' }
 * ])
 * // => 'Posting' (誰か1人でも Posting なら Posting)
 */
export const derivePostingStatus = (
    recipients: RecipientState[],
): PostingStatus => {
    // 全員が Initial → 全体も Initial
    if (recipients.every((r) => r.type === 'Initial')) {
        return 'Initial'
    }

    // 誰か1人でも Writing → 全体は Writing
    if (recipients.some((r) => r.type === 'Writing')) {
        return 'Writing'
    }

    // 誰か1人でも Posting → 全体は Posting
    if (recipients.some((r) => r.type === 'Posting')) {
        return 'Posting'
    }

    // 全員が Success/Error → 全体は Delivered
    return 'Delivered'
}

/**
 * Recipients から有効な投稿先を抽出する
 *
 * @pure この関数は純粋関数であり、副作用を持たない
 * @param recipients - Recipients の配列
 * @param validationResults - 各SNSの Validation 結果
 * @returns 有効な投稿先の配列
 *
 * @example
 * const validRecipients = filterValidRecipients(
 *   [
 *     { type: 'Writing', recipient: 'Twitter', paused: false },
 *     { type: 'Writing', recipient: 'Bluesky', paused: true }
 *   ],
 *   {
 *     Twitter: { type: 'Valid' },
 *     Bluesky: { type: 'Valid' }
 *   }
 * )
 * // => ['Twitter'] (Bluesky は paused なので除外)
 */
export const filterValidRecipients = (
    recipients: RecipientState[],
    validationResults: Record<SocialMedia, PostValidateState>,
): SocialMedia[] => {
    return recipients
        .filter((r) => r.type === 'Writing' && !r.paused)
        .filter((r) => validationResults[r.recipient].type === 'Valid')
        .map((r) => r.recipient)
}
