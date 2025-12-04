import { useCallback } from 'react'

import { useDeliveryStorage } from '~/hooks/useDeliveryStorage'
import { useMessenger } from '~/hooks/useMessenger'
import { useTwitterAdapter } from '~/hooks/useTwitterAdapter'
import type { BackgroundMessage } from '~/models/BackgroundMessage'
import type { Draft } from '~/models/Draft'
import type { RecipientState } from '~/models/RecipientState'

export const usePostTransaction = () => {
    const { postMessage } = useMessenger()
    const { saveDeliveryState } = useDeliveryStorage()
    const { clickTweetButton } = useTwitterAdapter()

    const startPost = useCallback(
        (draft: Draft, recipients: RecipientState[]) => {
            const message: BackgroundMessage = {
                type: 'Post',
                draft: JSON.stringify(draft),
                recipients,
            }
            postMessage(message)
        },
        [postMessage],
    )

    const finalizePost = useCallback(
        async (recipients: RecipientState[]) => {
            const postingRecipients = recipients.filter(
                (r) =>
                    r.type === 'Posting' || r.type === 'Success' || r.type === 'Error',
            )
            await saveDeliveryState(postingRecipients)
            clickTweetButton()
        },
        [saveDeliveryState, clickTweetButton],
    )

    return {
        startPost,
        finalizePost,
    }
}
