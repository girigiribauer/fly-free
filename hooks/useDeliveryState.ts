import { useCallback, useEffect, useMemo, useState } from 'react'

import {
    calculateRecipients,
    filterValidRecipients,
    shouldTransitionToDelivered,
    updateRecipientsWithMessage,
} from '~/libs/deliveryStateLogic'
import type { Draft } from '~/models/Draft'
import type {
    DeliveryAgentState,
    DeliveryAgentStateDelivered,
    DeliveryAgentStateOnDelivery,
} from '~/models/DeliveryAgentState'
import type { PostMessageState } from '~/models/PostMessageState'
import type { Preference } from '~/models/Preference'
import type { ProcessMessage } from '~/models/ProcessMessage'
import type { SocialMedia } from '~/models/SocialMedia'
import { clearDelivery } from '~/stores/PreferenceStore'

export const useDeliveryState = (draft: Draft | null, pref: Preference) => {
    const [delivery, setDelivery] = useState<DeliveryAgentState>({
        type: 'Initial',
    })

    // Calculate recipients based on delivery state and draft
    const recipients: PostMessageState[] = useMemo(
        () =>
            calculateRecipients(
                delivery.type,
                'recipients' in delivery ? delivery.recipients : undefined,
                draft,
                pref,
            ),
        [delivery, draft, pref],
    )

    const validRecipients: SocialMedia[] = useMemo(
        () => filterValidRecipients(recipients),
        [recipients],
    )

    // Clear storage when delivery is completed (Delivered state)
    // This ensures error states don't persist to the next window
    useEffect(() => {
        if (delivery.type === 'Delivered') {
            clearDelivery().catch((error) => {
                console.error('Failed to clear delivery storage:', error)
            })
        }
    }, [delivery.type])

    const updateFromMessage = useCallback(
        (message: ProcessMessage) => {
            if (delivery.type !== 'OnDelivery') return

            if (message.type !== 'Success' && message.type !== 'Error') return

            const updatedRecipients = updateRecipientsWithMessage(
                delivery.recipients,
                message,
            )

            let newDeliveryAgent:
                | DeliveryAgentStateOnDelivery
                | DeliveryAgentStateDelivered = {
                type: 'OnDelivery',
                recipients: updatedRecipients,
                draft: delivery.draft
            }

            if (shouldTransitionToDelivered(updatedRecipients)) {
                newDeliveryAgent = {
                    ...newDeliveryAgent,
                    type: 'Delivered',
                }
            }
            setDelivery(newDeliveryAgent)
        },
        [delivery],
    )

    // For Timeout and Window Close logic (updating Posting -> Error)
    const finalizeDelivery = useCallback((reason: string = 'Timeout') => {
        setDelivery((prev) => {
            if (prev.type !== 'OnDelivery') return prev

            const hasPosting = prev.recipients.some((r) => r.type === 'Posting')
            if (!hasPosting) return prev

            const updatedRecipients = prev.recipients.map((r) => {
                if (r.type === 'Posting') {
                    return {
                        ...r,
                        type: 'Error',
                        error: reason,
                    } as PostMessageState
                }
                return r
            })

            let newDeliveryAgent:
                | DeliveryAgentStateOnDelivery
                | DeliveryAgentStateDelivered = {
                type: 'OnDelivery',
                recipients: updatedRecipients,
                draft: prev.draft
            }

            if (shouldTransitionToDelivered(updatedRecipients)) {
                newDeliveryAgent = {
                    ...newDeliveryAgent,
                    type: 'Delivered',
                }
            }

            return newDeliveryAgent
        })
    }, [])

    return {
        delivery,
        setDelivery,
        recipients,
        validRecipients,
        updateFromMessage,
        finalizeDelivery
    }
}
