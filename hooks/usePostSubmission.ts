import { useCallback } from 'react'

import { filterValidRecipients } from '~/libs/deliveryStateLogic'
import type { DeliveryAgentState } from '~/models/DeliveryAgentState'
import type { PostMessageState } from '~/models/PostMessageState'
import type { ProcessMessage } from '~/models/ProcessMessage'
import { captureDraft, queryFromUnstableDOM } from '~/libs/twitterDOM'

export const usePostSubmission = (
    delivery: DeliveryAgentState,
    setDelivery: (state: DeliveryAgentState) => void,
) => {
    const handleSubmit = useCallback(() => {
        if (delivery.type !== 'Writing') return

        // Sentences are cut off in the middle (only Bluesky)
        const draft = captureDraft(queryFromUnstableDOM())
        if (!draft) return

        const validRecipientNames = filterValidRecipients(delivery.recipients)
        const validRecipients = delivery.recipients
            .filter((r) => validRecipientNames.includes(r.recipient))
            .map<PostMessageState>((r) => ({
                type: 'Posting',
                recipient: r.recipient,
            }))

        setDelivery({ type: 'OnDelivery', recipients: validRecipients })

        const message: ProcessMessage = {
            type: 'Post',
            draft: JSON.stringify(draft),
            recipients: validRecipients,
        }
        chrome.runtime.sendMessage(message)
    }, [delivery, setDelivery])

    return { handleSubmit }
}
