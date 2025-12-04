import { useCallback, useMemo, useState } from 'react'

import { useInitialState } from '~/hooks/useInitialState'
import { usePreference } from '~/hooks/usePreference'
import { derivePostingStatus } from '~/libs/recipientStatus'
import type { ProcessMessageError, ProcessMessageSuccess } from '~/models/ProcessMessage'
import type { Draft } from '~/models/Draft'
import type { RecipientState } from '~/models/RecipientState'
import type { SocialMedia } from '~/models/SocialMedia'
import { updateStore } from '~/models/Store'

export const useRecipientManager = (
    draft: Draft | null,
) => {
    const [recipients, setRecipients] = useState<RecipientState[]>([
        { type: 'Initial', recipient: 'Twitter' },
        { type: 'Initial', recipient: 'Bluesky' },
    ])

    const pref = usePreference()
    const status = useMemo(() => derivePostingStatus(recipients), [recipients])

    // Restore state and handle draft detection
    useInitialState(draft, pref, status, setRecipients)

    const toggleRecipient = useCallback(
        async (id: string) => {
            const media = id as SocialMedia
            const recipient = recipients.find((r) => r.recipient === media)
            if (!recipient || recipient.type !== 'Writing') return

            const newPaused = !recipient.paused
            const keyMap: Record<SocialMedia, string> = {
                Twitter: 'twitterPaused',
                Bluesky: 'blueskyPaused',
            }
            await updateStore({ [keyMap[media]]: newPaused })

            setRecipients((prev) =>
                prev.map((r) =>
                    r.recipient === media && r.type === 'Writing'
                        ? { ...r, paused: newPaused }
                        : r,
                ),
            )
        },
        [recipients],
    )

    const updateRecipientStatus = useCallback(
        (receivedMessage: BackgroundMessageSuccess | BackgroundMessageError) => {
            setRecipients((prev) =>
                prev.map((r) =>
                    r.recipient === receivedMessage.recipient
                        ? (receivedMessage as RecipientState)
                        : r,
                ),
            )
        },
        [],
    )

    const resetRecipients = useCallback(() => {
        setRecipients([
            { type: 'Initial', recipient: 'Twitter' },
            { type: 'Initial', recipient: 'Bluesky' },
        ])
    }, [])

    return {
        recipients,
        status,
        setRecipients, // Exposed for direct manipulation if needed (e.g. start posting)
        toggleRecipient,
        updateRecipientStatus,
        resetRecipients,
    }
}
