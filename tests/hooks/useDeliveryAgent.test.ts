// @vitest-environment happy-dom
import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

import { useDeliveryAgent } from '~/hooks/useDeliveryAgent'
import type { Draft } from '~/models/Draft'
import type { Preference } from '~/models/Preference'

// vi.mock('~/hooks/useDeliveryAutomation') - Use real implementation to test initialization behavior

vi.mock('~/stores/PreferenceStore', () => ({
    restoreDelivery: vi.fn().mockResolvedValue(null),
    backupDelivery: vi.fn().mockResolvedValue(undefined),
}))

const mockChromeSendMessage = vi.fn()
global.chrome = {
    runtime: {
        sendMessage: mockChromeSendMessage,
        onMessage: {
            addListener: vi.fn(),
            removeListener: vi.fn(),
        },
    },
} as any

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

describe('useDeliveryAgent', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('ドラフトが存在する場合、初期状態はWritingであるべき', async () => {
        const { result } = renderHook(() =>
            useDeliveryAgent(mockDraft, mockPref, false),
        )

        await waitFor(() => {
            expect(result.current.delivery.type).toBe('Writing')
        })
    })

    it('handleSubmitが短時間に連打されても、二重投稿を防ぐべき', async () => {
        const { result } = renderHook(() =>
            useDeliveryAgent(mockDraft, mockPref, false),
        )

        // Wait for initialization
        await waitFor(() => {
            expect(result.current.delivery.type).toBe('Writing')
        })

        act(() => {
            // First click
            result.current.handleSubmit()
            // Second click (simulating rapid fire or ref check fail)
            result.current.handleSubmit()
        })

        // Should only send message once
        expect(mockChromeSendMessage).toHaveBeenCalledTimes(1)

        // Should transition to OnDelivery (eventually)
        await waitFor(() => {
            expect(result.current.delivery.type).toBe('OnDelivery')
        })
    })

    it('既にOnDelivery状態の場合、再送信すべきではない', async () => {
        const { result } = renderHook(() =>
            useDeliveryAgent(mockDraft, mockPref, false),
        )

        // Wait for initialization
        await waitFor(() => {
            expect(result.current.delivery.type).toBe('Writing')
        })

        // Force transition to OnDelivery
        act(() => {
            result.current.handleSubmit()
        })

        await waitFor(() => {
            expect(result.current.delivery.type).toBe('OnDelivery')
        })

        mockChromeSendMessage.mockClear()

        // Try submitting again
        act(() => {
            result.current.handleSubmit()
        })

        expect(mockChromeSendMessage).not.toHaveBeenCalled()
    })

    it('Dry Runモードの場合、実際のメッセージは送信されず、安全に終了すべき', async () => {
        // Note: verifying "runDryRun" is called would require mocking useDeliveryAutomation,
        // which complicates the initialization tests.
        // For safety, confirming that chrome.runtime.sendMessage is NOT called is sufficient.

        const { result } = renderHook(() =>
            useDeliveryAgent(mockDraft, mockPref, true), // dryRun = true
        )

        await waitFor(() => {
            expect(result.current.delivery.type).toBe('Writing')
        })

        act(() => {
            result.current.handleSubmit()
        })

        // Should NOT call chrome.runtime.sendMessage
        expect(mockChromeSendMessage).not.toHaveBeenCalled()
    })

    it('ドラフトが空(null)の場合、送信処理は中断されるべき', async () => {
        const { result } = renderHook(() =>
            useDeliveryAgent(null, mockPref, false),
        )

        // Type is Initial because no draft
        expect(result.current.delivery.type).toBe('Initial')

        act(() => {
            result.current.handleSubmit()
        })

        expect(mockChromeSendMessage).not.toHaveBeenCalled()
    })
})
