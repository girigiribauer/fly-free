import { useCallback, useRef } from 'react'

import type { ComposerHeaderProps } from '~/components/ComposerHeader'
import type { DeliveryViewProps } from '~/components/DeliveryView'
import { useDraftScanner } from '~/hooks/orchestrator/useDraftScanner'
import { usePostTransaction } from '~/hooks/orchestrator/usePostTransaction'
import { useRecipientManager } from '~/hooks/orchestrator/useRecipientManager'
import { useMessageListener } from '~/hooks/useMessageListener'
import { useReplaceTitle } from '~/hooks/useReplaceTitle'
import { useResizeAndReload } from '~/hooks/useResizeAndReload'
import { filterValidRecipients } from '~/libs/recipientStatus'
import type { BackgroundMessage } from '~/models/BackgroundMessage'
import type { PostingStatus } from '~/models/PostingStatus'
import type { RecipientState } from '~/models/RecipientState'
import type { SocialMedia } from '~/models/SocialMedia'

export const usePostOrchestrator = (
    containerRef: React.MutableRefObject<HTMLElement>,
    submitRef: React.MutableRefObject<HTMLButtonElement | undefined>,
): {
    composerHeaderProps: ComposerHeaderProps
    deliveryViewProps: DeliveryViewProps
    status: PostingStatus
    recipients: RecipientState[]
} => {
    // 1. Independent Hooks
    useReplaceTitle()
    useResizeAndReload()

    // 2. Draft System
    const { draft, validationResults } = useDraftSystem(containerRef, submitRef)

    // 3. Recipient Manager
    const {
        recipients,
        status,
        setRecipients,
        toggleRecipient,
        updateRecipientStatus,
        resetRecipients,
    } = useRecipientManager(draft)

    // 4. Derived State (Validation)
    const validRecipients: SocialMedia[] = useMemo(
        () => filterValidRecipients(recipients, validationResults),
        [recipients, validationResults],
    )

    // 5. Post Transaction
    const { startPost, finalizePost } = usePostTransaction()

    // 6. Event Handlers
    const handleSubmit = useCallback(() => {
        if (status !== 'Writing') return
        if (!draft) return

        const newRecipients = recipients.map((r) =>
            validRecipients.includes(r.recipient)
                ? { type: 'Posting' as const, recipient: r.recipient }
                : r,
        )

        setRecipients(newRecipients)
        startPost(draft, newRecipients)
    }, [status, draft, recipients, validRecipients, setRecipients, startPost])

    const handleReceiveMessage = useCallback(
        (message: unknown) => {
            if (status !== 'Posting') return

            const receivedMessage = message as BackgroundMessage

            switch (receivedMessage.type) {
                case 'Success':
                case 'Error':
                    updateRecipientStatus(receivedMessage)
                    break

                case 'Tweet':
                    void finalizePost(recipients).then(() => {
                        resetRecipients()
                    })
                    break

                default:
                    console.warn('mismatch message')
                    return
            }
        },
        [status, updateRecipientStatus, finalizePost, recipients, resetRecipients],
    )

    const handleClose = useCallback(() => {
        window.close()
    }, [])

    const handleReload = useCallback(() => {
        location.reload()
    }, [])

    // 7. Listeners
    useMessageListener(handleReceiveMessage)

    // 8. Data Transformation (Domain Model -> View Model)
    const composerHeaderProps: ComposerHeaderProps = useMemo(() => {
        const isBeforePost = status === 'Initial' || status === 'Writing'

        return {
            visible: isBeforePost,
            recipients: recipients
                .filter((r) => r.type === 'Writing')
                .map((r) => {
                    let itemStatus: 'valid' | 'invalid' | 'paused' = 'valid'
                    if (r.paused) {
                        itemStatus = 'paused'
                    } else {
                        const validation = validationResults[r.recipient]
                        itemStatus = validation?.type === 'Invalid' ? 'invalid' : 'valid'
                    }

                    return {
                        id: r.recipient.toLowerCase(),
                        label: r.recipient,
                        enabled: true,
                        status: itemStatus,
                        errorMessage:
                            validationResults[r.recipient]?.type === 'Invalid'
                                ? validationResults[r.recipient].message
                                : undefined,
                    }
                }),
            canSubmit: status === 'Writing' && validRecipients.length > 0,
            canReload: isBeforePost,
            onToggleRecipient: toggleRecipient,
            onSubmit: handleSubmit,
            onReload: handleReload,
            submitRef,
        }
    }, [
        status,
        recipients,
        validationResults,
        validRecipients,
        toggleRecipient,
        handleSubmit,
        handleReload,
        submitRef,
    ])

    const deliveryViewProps: DeliveryViewProps = useMemo(() => {
        const isDelivering = status === 'Posting' || status === 'Delivered'

        return {
            visible: isDelivering,
            title: status === 'Posting' ? 'Posting...' : 'Posted',
            deliveries: recipients.map((r) => {
                let deliveryStatus: 'posting' | 'success' | 'error' = 'posting'
                let url: string | undefined
                let errorMessage: string | undefined

                if (r.type === 'Success') {
                    deliveryStatus = 'success'
                    url = r.url
                } else if (r.type === 'Error') {
                    deliveryStatus = 'error'
                    errorMessage = r.error
                } else if (r.type === 'Posting') {
                    deliveryStatus = 'posting'
                }

                return {
                    id: r.recipient.toLowerCase(),
                    label: r.recipient,
                    status: deliveryStatus,
                    url,
                    errorMessage,
                }
            }),
            autoCloseCountdown: null, // Will be overridden in content.tsx
            onClose: handleClose,
        }
    }, [status, recipients, handleClose])

    return {
        composerHeaderProps,
        deliveryViewProps,
        status,
        recipients,
    }
}
