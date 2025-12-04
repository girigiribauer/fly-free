import { describe, expect, it } from 'vitest'

import {
    calculateRecipients,
    filterValidRecipients,
    shouldTransitionToDelivered,
    updateRecipientsWithMessage,
} from '~/libs/deliveryStateLogic'
import type { Draft } from '~/models/Draft'
import type { PostMessageState } from '~/models/PostMessageState'
import type { Preference } from '~/models/Preference'
import type { ProcessMessage } from '~/models/ProcessMessage'

const mockPref: Preference = {
    globalAutoclosing: false,
    globalForceblank: false,
    twitterPaused: false,
    blueskyPaused: false,
    blueskyUsername: '',
    blueskyPassword: '',
}

const mockDraft: Draft = {
    text: 'Hello World',
    imageURLs: [],
    linkcardURL: null,
}

describe('deliveryStateLogic', () => {
    describe('calculateRecipients', () => {
        it('should return Initial recipients when type is Initial', () => {
            const result = calculateRecipients('Initial', undefined, null, mockPref)
            expect(result).toHaveLength(2)
            expect(result[0]).toEqual({ type: 'Initial', recipient: 'Twitter' })
            expect(result[1]).toEqual({ type: 'Initial', recipient: 'Bluesky' })
        })

        it('should return Writing recipients with validation when type is Writing', () => {
            const result = calculateRecipients('Writing', undefined, mockDraft, mockPref)
            expect(result).toHaveLength(2)
            expect(result[0].type).toBe('Writing')
            expect(result[0].recipient).toBe('Twitter')
            // @ts-ignore
            expect(result[0].postValidate.type).toBe('Valid')

            expect(result[1].type).toBe('Writing')
            expect(result[1].recipient).toBe('Bluesky')
        })

        it('should return existing recipients for other types', () => {
            const existingRecipients: PostMessageState[] = [
                { type: 'Posting', recipient: 'Twitter' },
            ]
            const result = calculateRecipients(
                'OnDelivery',
                existingRecipients,
                mockDraft,
                mockPref,
            )
            expect(result).toBe(existingRecipients)
        })
    })

    describe('filterValidRecipients', () => {
        it('should filter valid and unpaused recipients', () => {
            const recipients: PostMessageState[] = [
                {
                    type: 'Writing',
                    recipient: 'Twitter',
                    paused: false,
                    postValidate: { type: 'Valid' },
                },
                {
                    type: 'Writing',
                    recipient: 'Bluesky',
                    paused: true, // Paused
                    postValidate: { type: 'Valid' },
                },
                {
                    type: 'Writing',
                    recipient: 'Taittsuu' as any,
                    paused: false,
                    postValidate: { type: 'Invalid', errors: [] }, // Invalid
                },
            ]

            const result = filterValidRecipients(recipients)
            expect(result).toEqual(['Twitter'])
        })
    })

    describe('shouldTransitionToDelivered', () => {
        it('should return true if no recipients are Posting', () => {
            const recipients: PostMessageState[] = [
                { type: 'Success', recipient: 'Twitter', url: '' },
                { type: 'Error', recipient: 'Bluesky', error: '' },
            ]
            expect(shouldTransitionToDelivered(recipients)).toBe(true)
        })

        it('should return false if some recipients are Posting', () => {
            const recipients: PostMessageState[] = [
                { type: 'Success', recipient: 'Twitter', url: '' },
                { type: 'Posting', recipient: 'Bluesky' },
            ]
            expect(shouldTransitionToDelivered(recipients)).toBe(false)
        })
    })

    describe('updateRecipientsWithMessage', () => {
        it('should update recipient status on Success message', () => {
            const currentRecipients: PostMessageState[] = [
                { type: 'Posting', recipient: 'Twitter' },
                { type: 'Posting', recipient: 'Bluesky' },
            ]
            const message: ProcessMessage = {
                type: 'Success',
                recipient: 'Twitter',
                url: 'http://example.com',
            }

            const result = updateRecipientsWithMessage(currentRecipients, message)
            expect(result[0]).toEqual({
                type: 'Success',
                recipient: 'Twitter',
                url: 'http://example.com',
            })
            expect(result[1].type).toBe('Posting')
        })

        it('should ignore unrelated messages', () => {
            const currentRecipients: PostMessageState[] = [
                { type: 'Posting', recipient: 'Twitter' },
            ]
            const message: ProcessMessage = {
                type: 'Post', // Not Success or Error
                draft: '',
                recipients: [],
            }

            const result = updateRecipientsWithMessage(currentRecipients, message)
            expect(result).toBe(currentRecipients)
        })
    })
})
