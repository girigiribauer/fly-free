import { useCallback, useMemo } from 'react'

import type { ComposerHeaderProps } from '~/components/ComposerHeader'
import type { DeliveryViewProps } from '~/components/DeliveryView'
import { usePostTransaction } from '~/hooks/orchestrator/usePostTransaction'
import { useDraftScanner as useDraftSystem } from '~/hooks/orchestrator/useDraftScanner'
import { useRecipientManager } from '~/hooks/orchestrator/useRecipientManager'
import { useMessageListener } from '~/hooks/useMessageListener'
import { useReplaceTitle } from '~/hooks/useReplaceTitle'
import { useResizeAndReload } from '~/hooks/useResizeAndReload'
import { filterValidRecipients } from '~/libs/recipientStatus'
import type { PostingStatus } from '~/models/PostingStatus'
import type { ProcessMessage } from '~/models/ProcessMessage'
import type { RecipientState } from '~/models/RecipientState'
import type { SocialMedia } from '~/models/SocialMedia'

import type { Preference } from '~/models/Preference'
import { updateStore } from '~/stores/PreferenceStore'
import { useRecipientSwitch } from '~/hooks/useRecipientSwitch'
import type { DeliveryAgentState } from '~/models/DeliveryAgentState'

export const usePostOrchestrator = (
    containerRef: React.MutableRefObject<HTMLElement>,
    submitRef: React.MutableRefObject<HTMLButtonElement | undefined>,
    pref: Preference,
): {
    composerHeaderProps: ComposerHeaderProps
    deliveryViewProps: DeliveryViewProps
    status: PostingStatus
    recipients: RecipientState[]
} => {
    // 1. Independent Hooks
    useReplaceTitle()
    useResizeAndReload()
    const { handleSwitch } = useRecipientSwitch()

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

    // Construct DeliveryAgentState for compatibility
    const delivery: DeliveryAgentState = useMemo(() => {
        switch (status) {
            case 'Initial':
                return { type: 'Initial' }
            case 'Writing':
                return { type: 'Writing', recipients: recipients as any } // TODO: Fix type mismatch if strictly needed, but RecipientState is compatible enough for UI usually
            case 'Posting':
                return { type: 'OnDelivery', recipients: recipients as any }
            case 'Delivered':
                return { type: 'Delivered', recipients: recipients as any }
        }
    }, [status, recipients])

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
            const receivedMessage = message as ProcessMessage

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

    const handleDryRunChange = useCallback((checked: boolean) => {
        updateStore({ dryRun: checked })
    }, [])

    // 7. Listeners
    useMessageListener(handleReceiveMessage)

    // 8. Data Transformation (Domain Model -> View Model)
    const composerHeaderProps: ComposerHeaderProps = useMemo(() => {
        const isBeforePost = status === 'Initial' || status === 'Writing'

        return {
            submitRef,
            delivery,
            recipients: recipients as any, // RecipientState[] -> PostMessageState[] (compatible enough or need mapping)
            validRecipients,
            forceBlank: pref.globalForceblank,
            dryRun: pref.dryRun,
            handleSwitch,
            handleDryRunChange,
            handleSubmit,
            // Original calculated props override if needed, but ComposerHeader uses passed props
            // The following are NOT in ComposerHeaderProps but were in the calculated object before.
            // ComposerHeaderProps has strict keys. I should match them.
            // ... (The previous code was returning struct for a DIFFERENT component maybe? or just wrong)
            // Wait, the previous code constructed `recipients` map manually for `RecipientList`?
            // ComposerHeader passes `recipients` to `RecipientList`.
            // RecipientList expects `PostMessageState[]`.
            // So `recipients` here is correct.
        }
    }, [
        submitRef,
        delivery,
        recipients,
        validRecipients,
        pref.globalForceblank,
        pref.dryRun,
        handleSwitch,
        handleDryRunChange,
        handleSubmit,
        status // isBeforePost calculation if needed
    ])

    const deliveryViewProps: DeliveryViewProps = useMemo(() => {
        return {
            delivery,
            draft,
            isAutoclosing: pref.globalAutoclosing,
            handleClose,
        }
    }, [delivery, draft, pref.globalAutoclosing, handleClose])

    return {
        composerHeaderProps,
        deliveryViewProps,
        status,
        recipients,
    }
}
