import { useCallback, useEffect, useMemo, useState } from 'react'

import { SelectorTweetButton } from '~/definitions'
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
import { backupDelivery, restoreDelivery } from '~/stores/PreferenceStore'

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

    const handleReceiveMessage = useCallback(
        (message: unknown) => {
            if (delivery.type !== 'OnDelivery') return

            const receivedMessage = message as ProcessMessage

            let newDeliveryAgent:
                | DeliveryAgentStateOnDelivery
                | DeliveryAgentStateDelivered

            switch (receivedMessage.type) {
                case 'Success':
                case 'Error':
                    const updatedRecipients = updateRecipientsWithMessage(
                        delivery.recipients,
                        receivedMessage,
                    )

                    newDeliveryAgent = {
                        type: 'OnDelivery',
                        recipients: updatedRecipients,
                    }
                    break

                case 'Tweet':
                    const button = document.querySelector(
                        SelectorTweetButton,
                    ) as HTMLDivElement

                        ; (async () => {
                            await backupDelivery(delivery)
                            button.click()
                            // Don't reset state here - let auto-close handle it
                        })()
                    return  // Don't update delivery state

                default:
                    console.warn('mismatch message')
                    return
            }

            if (shouldTransitionToDelivered(newDeliveryAgent.recipients)) {
                newDeliveryAgent = {
                    ...newDeliveryAgent,
                    type: 'Delivered',
                }
            }
            setDelivery(newDeliveryAgent)
        },
        [delivery],
    )

    // Message listener
    useEffect(() => {
        chrome.runtime.onMessage.addListener(handleReceiveMessage)

        return () => {
            chrome.runtime.onMessage.removeListener(handleReceiveMessage)
        }
    }, [handleReceiveMessage])

    // Initialize or restore delivery state
    useEffect(() => {
        if (delivery.type !== 'Initial') return

        void (async () => {
            const restored = await restoreDelivery()

            if (restored) {
                setDelivery({
                    type: 'Delivered',
                    recipients: restored.recipients.map((r) =>
                        r.recipient === 'Twitter'
                            ? {
                                type: 'Success',
                                recipient: 'Twitter',
                                url: 'https://twitter.com', // cannot post URL
                            }
                            : r,
                    ),
                })
            } else if (draft) {
                // Calculate recipients here to avoid dependency on recipients
                const initialRecipients = calculateRecipients(
                    'Writing',
                    undefined,
                    draft,
                    pref,
                )
                setDelivery({
                    type: 'Writing',
                    recipients: initialRecipients,
                })
            }
        })()
    }, [draft, pref])

    return {
        delivery,
        setDelivery,
        recipients,
        validRecipients,
    }
}
