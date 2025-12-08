import { useCallback } from 'react'

import { SelectorTweetButton } from '~/definitions'
import { useDeliveryStorage } from '~/hooks/useDeliveryStorage'
import type { Draft } from '~/models/Draft'
import type { ProcessMessage } from '~/models/ProcessMessage'
import type { RecipientState } from '~/models/RecipientState'

export const usePostTransaction = () => {
    const { saveDeliveryState } = useDeliveryStorage()

    const startPost = useCallback(
        (draft: Draft, recipients: RecipientState[]) => {
            const message: ProcessMessage = {
                type: 'Post',
                draft: JSON.stringify(draft),
                recipients,
            }
            chrome.runtime.sendMessage(message)
        },
        [],
    )

    const finalizePost = useCallback(
        async (recipients: RecipientState[]) => {
            const postingRecipients = recipients.filter(
                (r) =>
                    r.type === 'Posting' || r.type === 'Success' || r.type === 'Error',
            )
            await saveDeliveryState(postingRecipients)

            const button = document.querySelector(SelectorTweetButton) as HTMLDivElement
            button?.click()
        },
        [saveDeliveryState],
    )

    return {
        startPost,
        finalizePost,
    }
}
