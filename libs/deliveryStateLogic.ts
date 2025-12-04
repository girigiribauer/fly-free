import type { Draft } from '~/models/Draft'
import type { DeliveryAgentState } from '~/models/DeliveryAgentState'
import type { PostMessageState } from '~/models/PostMessageState'
import type { Preference } from '~/models/Preference'
import type { SocialMedia } from '~/models/SocialMedia'
import type { ProcessMessage } from '~/models/ProcessMessage'
import { blueskyValidationRule } from '~/infrastructures/BlueskyValidationRule'
import { twitterValidationRule } from '~/infrastructures/TwitterValidationRule'

export const calculateRecipients = (
    deliveryType: DeliveryAgentState['type'],
    deliveryRecipients: PostMessageState[] | undefined,
    draft: Draft | null,
    pref: Preference,
): PostMessageState[] => {
    const socialMedia: SocialMedia[] = ['Twitter', 'Bluesky']

    if (deliveryType === 'Initial') {
        return socialMedia.map<PostMessageState>((recipient) => ({
            type: 'Initial',
            recipient,
        }))
    }

    if (deliveryType === 'Writing') {
        return [
            {
                type: 'Writing',
                recipient: 'Twitter',
                paused: pref.twitterPaused,
                postValidate: twitterValidationRule.validate(draft, pref),
            },
            {
                type: 'Writing',
                recipient: 'Bluesky',
                paused: pref.blueskyPaused,
                postValidate: blueskyValidationRule.validate(draft, pref),
            },
        ]
    }

    return deliveryRecipients || []
}

export const filterValidRecipients = (
    recipients: PostMessageState[],
): SocialMedia[] => {
    return recipients
        .filter(
            (r) =>
                r.type === 'Writing' &&
                r.postValidate.type === 'Valid' &&
                !r.paused,
        )
        .map((r) => r.recipient)
}

export const shouldTransitionToDelivered = (
    recipients: PostMessageState[],
): boolean => {
    return !recipients.some((r) => r.type === 'Posting')
}

export const updateRecipientsWithMessage = (
    currentRecipients: PostMessageState[],
    message: ProcessMessage,
): PostMessageState[] => {
    if (message.type !== 'Success' && message.type !== 'Error') {
        return currentRecipients
    }

    return currentRecipients.map((r) => {
        if (r.recipient === message.recipient) {
            return message as PostMessageState
        }
        return r
    })
}
