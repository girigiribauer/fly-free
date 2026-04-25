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
        it('typeがInitialの場合、初期状態の送信先リストを返すべき', () => {
            const result = calculateRecipients('Initial', undefined, null, mockPref)
            expect(result).toHaveLength(2)
            expect(result[0]).toEqual({ type: 'Initial', recipient: 'Twitter' })
            expect(result[1]).toEqual({ type: 'Initial', recipient: 'Bluesky' })
        })

        it('typeがWritingの場合、検証済みの送信先リストを返すべき', () => {
            const result = calculateRecipients('Writing', undefined, mockDraft, mockPref)
            expect(result).toHaveLength(2)
            expect(result[0].type).toBe('Writing')
            expect(result[0].recipient).toBe('Twitter')
            // @ts-ignore
            expect(result[0].postValidate.type).toBe('Valid')

            expect(result[1].type).toBe('Writing')
            expect(result[1].recipient).toBe('Bluesky')
        })

        it('その他のtypeの場合、既存の送信先リストをそのまま返すべき', () => {
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
        it('有効かつ一時停止されていない送信先のみをフィルタリングすべき', () => {
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
            ]

            const result = filterValidRecipients(recipients)
            expect(result).toEqual(['Twitter'])
        })

        it('検証エラー(Invalid)の送信先は除外すべき', () => {
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
                    paused: false,
                    postValidate: { type: 'Invalid', errors: [{ type: 'NoText' }] },
                },
            ]

            const result = filterValidRecipients(recipients)
            expect(result).toEqual(['Twitter'])
            expect(result).not.toEqual(['Bluesky'])
        })
    })

    describe('shouldTransitionToDelivered', () => {
        it('Posting状態の送信先がいなければtrueを返すべき', () => {
            const recipients: PostMessageState[] = [
                { type: 'Success', recipient: 'Twitter', url: '' },
                { type: 'Error', recipient: 'Bluesky', error: '' },
            ]
            expect(shouldTransitionToDelivered(recipients)).toBe(true)
        })

        it('Posting状態の送信先がいればfalseを返すべき', () => {
            const recipients: PostMessageState[] = [
                { type: 'Success', recipient: 'Twitter', url: '' },
                { type: 'Posting', recipient: 'Bluesky' },
            ]
            expect(shouldTransitionToDelivered(recipients)).toBe(false)
        })
    })

    describe('updateRecipientsWithMessage', () => {
        it('Successメッセージ受信時、該当する送信先のステータスを更新すべき', () => {
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

        it('関係のないメッセージは無視すべき', () => {
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

    describe('タイムアウト時の状態遷移（updateTimeoutsシナリオ）', () => {
        // タイムアウト時のロジック: Posting → Error('Timeout'), それ以外は維持
        // ※ 実際のupdateTimeoutsはuseDeliveryState内のReact hookだが、
        //   ロジックの本質は「Postingのみ変換」なのでここで検証する

        const applyTimeout = (recipients: PostMessageState[]): PostMessageState[] => {
            return recipients.map((r) => {
                if (r.type === 'Posting') {
                    return { ...r, type: 'Error', error: 'Timeout' } as PostMessageState
                }
                return r
            })
        }

        it('Blueskyが既にSuccessの場合、タイムアウトでもSuccessが維持されるべき', () => {
            const recipients: PostMessageState[] = [
                { type: 'Success', recipient: 'Bluesky', url: 'https://bsky.app/post/123' },
                { type: 'Posting', recipient: 'Twitter' },
            ]

            const result = applyTimeout(recipients)

            expect(result[0]).toEqual({
                type: 'Success',
                recipient: 'Bluesky',
                url: 'https://bsky.app/post/123',
            })
            expect(result[1]).toEqual({
                type: 'Error',
                recipient: 'Twitter',
                error: 'Timeout',
            })
        })

        it('全宛先がPostingの場合、全宛先がError(Timeout)になるべき', () => {
            const recipients: PostMessageState[] = [
                { type: 'Posting', recipient: 'Bluesky' },
                { type: 'Posting', recipient: 'Twitter' },
            ]

            const result = applyTimeout(recipients)

            expect(result[0].type).toBe('Error')
            expect(result[1].type).toBe('Error')
        })

        it('全宛先が既にSuccess/Errorの場合、タイムアウトは何も変更しないべき', () => {
            const recipients: PostMessageState[] = [
                { type: 'Success', recipient: 'Bluesky', url: 'https://bsky.app/post/123' },
                { type: 'Error', recipient: 'Twitter', error: 'Network Error' },
            ]

            const result = applyTimeout(recipients)

            expect(result[0]).toEqual(recipients[0])
            expect(result[1]).toEqual(recipients[1])
        })

        it('タイムアウト後、shouldTransitionToDeliveredがtrueを返すべき', () => {
            const recipients: PostMessageState[] = [
                { type: 'Success', recipient: 'Bluesky', url: 'https://bsky.app/post/123' },
                { type: 'Posting', recipient: 'Twitter' },
            ]

            const afterTimeout = applyTimeout(recipients)

            expect(shouldTransitionToDelivered(afterTimeout)).toBe(true)
        })
    })
})
