import { useCallback, useEffect, useRef } from 'react'
import { sendDebugLog } from '~/libs/remoteLogger'

import { SelectorTweetButton } from '~/definitions'
import { calculateRecipients } from '~/libs/deliveryStateLogic'
import type { Draft } from '~/models/Draft'
import type { DeliveryAgentState } from '~/models/DeliveryAgentState'
import type { PostMessageState } from '~/models/PostMessageState'
import type { Preference } from '~/models/Preference'
import type { ProcessMessage } from '~/models/ProcessMessage'
import { backupDelivery, restoreDelivery } from '~/stores/PreferenceStore'

type Actions = {
    setDelivery: (state: DeliveryAgentState) => void
    updateFromMessage: (message: ProcessMessage) => void
    updateTimeouts: () => void
}

/**
 * Encapsulates the logic for handling incoming chrome messages and browser interactions
 */
const useMessageActionHandler = (
    delivery: DeliveryAgentState,
    updateFromMessage: Actions['updateFromMessage'],
) => {
    const isTweetClickedRef = useRef(false)

    const handleReceiveMessage = useCallback(
        (message: unknown) => {
            const receivedMessage = message as ProcessMessage
            sendDebugLog({ msg: 'useDeliveryAutomation handleReceiveMessage:', data: receivedMessage })

            switch (receivedMessage.type) {
                case 'Success':
                case 'Error':
                    updateFromMessage(receivedMessage)
                    break

                case 'Tweet':
                    if (delivery.type !== 'OnDelivery') return
                    if (isTweetClickedRef.current) return
                    isTweetClickedRef.current = true

                    const button = document.querySelector(
                        SelectorTweetButton,
                    ) as HTMLDivElement

                    if (!button) {
                        console.warn('Tweet button not found')
                        return
                    }

                    ; (async () => {
                        await backupDelivery(delivery)
                        button.click()
                        // Don't reset state here - let auto-close handle it
                    })()
                    return

                default:
                    console.warn('mismatch message')
                    return
            }
        },
        [delivery, updateFromMessage],
    )

    const handleReceiveMessageRef = useRef(handleReceiveMessage)

    useEffect(() => {
        handleReceiveMessageRef.current = handleReceiveMessage
    }, [handleReceiveMessage])

    return { handleReceiveMessageRef }
}

/**
 * Sets up the Chrome runtime message listener
 */
const useChromeMessageListener = (
    handlerRef: React.MutableRefObject<(message: unknown) => void>,
) => {
    useEffect(() => {
        const listener = (message: unknown) => {
            handlerRef.current(message)
        }
        chrome.runtime.onMessage.addListener(listener)

        return () => {
            chrome.runtime.onMessage.removeListener(listener)
        }
    }, []) // Empty dependency array: bind once
}

/**
 * Handles state restoration from storage or initialization from draft
 */
const useDeliveryRestoration = (
    deliveryType: DeliveryAgentState['type'],
    draft: Draft | null,
    pref: Preference,
    setDelivery: Actions['setDelivery'],
) => {
    useEffect(() => {
        if (deliveryType !== 'Initial') return

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
                                url: 'https://twitter.com',
                            }
                            : r,
                    ),
                })
            } else if (draft) {
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
    }, [draft, pref, setDelivery]) // dependencies minimal
}

/**
 * Monitors the delivery state and triggers timeout if it takes too long
 */
const useDeliveryTimeout = (
    deliveryType: DeliveryAgentState['type'],
    updateTimeouts: Actions['updateTimeouts'],
) => {
    useEffect(() => {
        if (deliveryType !== 'OnDelivery') return

        const timeoutId = setTimeout(() => {
            updateTimeouts()
        }, 300000) // Extended to 5 minutes to accommodate slower uploads/retries

        return () => clearTimeout(timeoutId)
    }, [deliveryType, updateTimeouts])
}

export const useDeliveryAutomation = (
    delivery: DeliveryAgentState,
    draft: Draft | null,
    pref: Preference,
    // dryRun argument removed as it was unused (relied on process.env)
    actions: Actions,
) => {
    const { setDelivery, updateFromMessage, updateTimeouts } = actions

    // 1. Setup Action Handler
    const { handleReceiveMessageRef } = useMessageActionHandler(
        delivery,
        updateFromMessage,
    )

    // 2. Attach Listener
    useChromeMessageListener(handleReceiveMessageRef)

    // 3. Handle Restoration / Initialization
    useDeliveryRestoration(delivery.type, draft, pref, setDelivery)

    // 4. Handle Timeouts
    useDeliveryTimeout(delivery.type, updateTimeouts)

    // 5. Dry Run Simulation (Exposed Action)
    const runDryRun = useCallback(
        (postingRecipients: PostMessageState[]) => {
            if (process.env.NODE_ENV === 'development') {
                postingRecipients.forEach((r, index) => {
                    setTimeout(() => {
                        const successMessage: ProcessMessage = {
                            type: 'Success',
                            recipient: r.recipient,
                            url: 'https://example.com/dry-run',
                        }
                        handleReceiveMessageRef.current(successMessage)
                    }, (index + 1) * 1000)
                })
            }
        },
        [handleReceiveMessageRef],
    )

    return { runDryRun }
}
