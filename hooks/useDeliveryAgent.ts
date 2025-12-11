import { useCallback, useRef } from 'react'
import { sendDebugLog } from '~/libs/remoteLogger'

import { useDeliveryAutomation } from '~/hooks/useDeliveryAutomation'
import { useDeliveryState } from '~/hooks/useDeliveryState'
import { cleanDraftText } from '~/libs/DraftUtils'
import type { Draft } from '~/models/Draft'
import type { PostMessageState } from '~/models/PostMessageState'
import type { Preference } from '~/models/Preference'
import type { ProcessMessage } from '~/models/ProcessMessage'

export const useDeliveryAgent = (
    draft: Draft | null,
    pref: Preference,
    dryRun: boolean,
) => {
    // 1. State Management (Pure)
    const {
        delivery,
        setDelivery,
        recipients,
        validRecipients,
        updateFromMessage,
        updateTimeouts,
    } = useDeliveryState(draft, pref)

    // 2. Automation & Side Effects (Dirty)
    const { runDryRun } = useDeliveryAutomation(delivery, draft, pref, {
        setDelivery,
        updateFromMessage,
        updateTimeouts,
    })

    const isSubmittingRef = useRef(false)

    // 3. Coordination (Action)
    const handleSubmit = useCallback(() => {
        if (delivery.type !== 'Writing') return
        if (isSubmittingRef.current) return

        isSubmittingRef.current = true

        if (!draft) {
            isSubmittingRef.current = false
            return
        }

        // Logic: Filter recipients
        const validRecipientNames = validRecipients // From useDeliveryState
        const postingRecipients = recipients
            .filter((r) => validRecipientNames.includes(r.recipient))
            .map<PostMessageState>((r) => ({
                type: 'Posting',
                recipient: r.recipient,
            }))

        setDelivery({ type: 'OnDelivery', recipients: postingRecipients })
        sendDebugLog('handleSubmit called. Sending Post message...')

        // DRY RUN
        if (dryRun) {
            runDryRun(postingRecipients)
            return
        }

        // REAL POST
        const currentDraft: Draft = {
            text: cleanDraftText(draft.text),
            imageURLs: draft.imageURLs,
            linkcardURL: draft.linkcardURL,
        }

        const message: ProcessMessage = {
            type: 'Post',
            draft: JSON.stringify(currentDraft),
            recipients: postingRecipients,
        }
        chrome.runtime.sendMessage(message)
    }, [delivery.type, recipients, validRecipients, draft, dryRun, setDelivery, runDryRun])

    return {
        delivery,
        recipients,
        validRecipients,
        handleSubmit,
    }
}
