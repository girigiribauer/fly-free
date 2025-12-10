import { useCallback } from 'react'

import { SelectorTweetButton } from '~/definitions'
import { backupDelivery } from '~/stores/PreferenceStore'
import type { Draft } from '~/models/Draft'
import type { RecipientState } from '~/models/RecipientState'
import type { PostMessageState } from '~/models/PostMessageState'

/**
 * Simplified version of usePostTransaction for compatibility testing
 * Uses current implementation (chrome.runtime.sendMessage) instead of Mock Adapters
 */
export const usePostTransactionCompat = () => {
    const startPost = useCallback((draft: Draft, recipients: RecipientState[]) => {
        // Convert RecipientState[] to PostMessageState[] for compatibility
        const postingRecipients: PostMessageState[] = recipients.map((r) => ({
            type: 'Posting' as const,
            recipient: r.recipient,
        }))

        const message = {
            type: 'Post' as const,
            draft: JSON.stringify(draft),
            recipients: postingRecipients,
        }
        chrome.runtime.sendMessage(message)
    }, [])

    const finalizePost = useCallback(async (recipients: RecipientState[]) => {
        // Convert RecipientState[] to PostMessageState[] for backup
        const postingRecipients: PostMessageState[] = recipients
            .filter((r) => r.type === 'Posting' || r.type === 'Success' || r.type === 'Error')
            .map((r) => r as unknown as PostMessageState)

        await backupDelivery({ type: 'OnDelivery', recipients: postingRecipients })

        const button = document.querySelector(SelectorTweetButton) as HTMLDivElement
        button?.click()
    }, [])

    return {
        startPost,
        finalizePost,
    }
}
