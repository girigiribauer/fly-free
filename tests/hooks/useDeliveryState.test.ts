// @vitest-environment happy-dom
import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

import { useDeliveryState } from '~/hooks/useDeliveryState'
import type { Draft } from '~/models/Draft'
import type { Preference } from '~/models/Preference'
import type { ProcessMessage } from '~/models/ProcessMessage'

vi.mock('~/stores/PreferenceStore', () => ({
    clearDelivery: vi.fn().mockResolvedValue(undefined),
}))

const mockPref: Preference = {
    globalAutoclosing: false,
    globalForceblank: false,
    twitterPaused: false,
    blueskyPaused: false,
    blueskyUsername: 'test',
    blueskyPassword: 'test',
}

const mockDraft: Draft = {
    text: 'Hello World',
    imageURLs: [],
    linkcardURL: null,
}

describe('useDeliveryState', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('finalizeDelivery', () => {
        it('Posting状態の宛先のみがErrorに変換されるべき', async () => {
            const { result } = renderHook(() =>
                useDeliveryState(mockDraft, mockPref),
            )

            // OnDelivery状態に遷移（Bluesky: Success, Twitter: Posting）
            act(() => {
                result.current.setDelivery({
                    type: 'OnDelivery',
                    recipients: [
                        { type: 'Success', recipient: 'Bluesky', url: 'https://bsky.app/post/123' },
                        { type: 'Posting', recipient: 'Twitter' },
                    ],
                    draft: mockDraft,
                })
            })

            expect(result.current.delivery.type).toBe('OnDelivery')

            // 確定処理
            act(() => {
                result.current.finalizeDelivery('Interrupted by User')
            })

            // Blueskyは Success のまま維持されるべき
            expect(result.current.recipients[0]).toEqual({
                type: 'Success',
                recipient: 'Bluesky',
                url: 'https://bsky.app/post/123',
            })

            // TwitterのみErrorになるべき
            expect(result.current.recipients[1]).toEqual({
                type: 'Error',
                recipient: 'Twitter',
                error: 'Interrupted by User',
            })

            // 全宛先が確定したのでDeliveredに遷移すべき
            expect(result.current.delivery.type).toBe('Delivered')
        })

        it('全宛先がPostingの場合、全てErrorになるべき', async () => {
            const { result } = renderHook(() =>
                useDeliveryState(mockDraft, mockPref),
            )

            act(() => {
                result.current.setDelivery({
                    type: 'OnDelivery',
                    recipients: [
                        { type: 'Posting', recipient: 'Bluesky' },
                        { type: 'Posting', recipient: 'Twitter' },
                    ],
                    draft: mockDraft,
                })
            })

            act(() => {
                result.current.finalizeDelivery('Timeout')
            })

            expect(result.current.recipients[0].type).toBe('Error')
            expect(result.current.recipients[1].type).toBe('Error')
            expect(result.current.delivery.type).toBe('Delivered')
        })

        it('OnDelivery以外の状態では、確定処理は何も変更しないべき', async () => {
            const { result } = renderHook(() =>
                useDeliveryState(mockDraft, mockPref),
            )

            // Writing状態のまま
            act(() => {
                result.current.setDelivery({
                    type: 'Writing',
                    recipients: [
                        { type: 'Writing', recipient: 'Twitter', paused: false, postValidate: { type: 'Valid' } },
                        { type: 'Writing', recipient: 'Bluesky', paused: false, postValidate: { type: 'Valid' } },
                    ],
                })
            })

            const typeBefore = result.current.delivery.type

            act(() => {
                result.current.finalizeDelivery()
            })

            // 状態は変化しない
            expect(result.current.delivery.type).toBe(typeBefore)
        })
    })

    describe('updateFromMessage', () => {
        it('Successメッセージを受信したら、該当宛先がSuccessに更新されるべき', async () => {
            const { result } = renderHook(() =>
                useDeliveryState(mockDraft, mockPref),
            )

            act(() => {
                result.current.setDelivery({
                    type: 'OnDelivery',
                    recipients: [
                        { type: 'Posting', recipient: 'Bluesky' },
                        { type: 'Posting', recipient: 'Twitter' },
                    ],
                    draft: mockDraft,
                })
            })

            const successMessage: ProcessMessage = {
                type: 'Success',
                recipient: 'Bluesky',
                url: 'https://bsky.app/post/123',
            }

            act(() => {
                result.current.updateFromMessage(successMessage)
            })

            expect(result.current.recipients[0]).toEqual({
                type: 'Success',
                recipient: 'Bluesky',
                url: 'https://bsky.app/post/123',
            })
            // Twitterはまだ Posting のまま
            expect(result.current.recipients[1].type).toBe('Posting')
            // まだ全員終わっていないのでOnDeliveryのまま
            expect(result.current.delivery.type).toBe('OnDelivery')
        })

        it('全宛先がSuccess/Errorになったら、Deliveredに遷移すべき', async () => {
            const { result } = renderHook(() =>
                useDeliveryState(mockDraft, mockPref),
            )

            act(() => {
                result.current.setDelivery({
                    type: 'OnDelivery',
                    recipients: [
                        { type: 'Success', recipient: 'Bluesky', url: 'https://bsky.app/post/123' },
                        { type: 'Posting', recipient: 'Twitter' },
                    ],
                    draft: mockDraft,
                })
            })

            const twitterSuccess: ProcessMessage = {
                type: 'Success',
                recipient: 'Twitter',
                url: 'https://x.com/home',
            }

            act(() => {
                result.current.updateFromMessage(twitterSuccess)
            })

            expect(result.current.delivery.type).toBe('Delivered')
        })
    })
})
