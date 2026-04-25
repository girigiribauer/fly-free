import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DeliveryService } from '~/services/DeliveryService'
import type { Post } from '~/models/Post'
import type { Preference } from '~/models/Preference'
import type { PostMessageState } from '~/models/PostMessageState'

// Mocks
const mockPost = vi.fn()
const mockTwitterPost = vi.fn()

vi.mock('~/infrastructures/posters/BlueskyPoster', () => {
    return {
        BlueskyPoster: vi.fn().mockImplementation(() => ({
            post: mockPost
        }))
    }
})

vi.mock('~/infrastructures/posters/TwitterPoster', () => {
    return {
        TwitterPoster: vi.fn().mockImplementation(() => ({
            post: mockTwitterPost
        }))
    }
})

describe('DeliveryService', () => {
    let service: DeliveryService
    const mockTabID = 123

    // Fake data
    const dummyPost: Post = { text: 'test', images: [], linkcard: undefined }
    const dummyPref: Preference = {} as any

    beforeEach(() => {
        vi.clearAllMocks()
        service = new DeliveryService()

        // Mock global chrome object
        global.chrome = {
            tabs: {
                sendMessage: vi.fn()
            }
        } as any
    })

    it('Twitterへの投稿は、必ず他のAPI投稿（Bluesky等）の後に実行されること', async () => {
        const recipients: PostMessageState[] = [
            { type: 'Posting', recipient: 'Twitter' },
            { type: 'Posting', recipient: 'Bluesky' }
        ]

        mockPost.mockResolvedValue('https://bsky.app/post/123')
        mockTwitterPost.mockResolvedValue('Twitter UI Triggered')

        await service.deliver(dummyPost, recipients, dummyPref, mockTabID)

        expect(mockPost).toHaveBeenCalled()
        expect(mockTwitterPost).toHaveBeenCalled()

        // 呼び出し順序の厳密な確認 (Blueskyが先、Twitterが後)
        const blueskyOrder = mockPost.mock.invocationCallOrder[0]
        const twitterOrder = mockTwitterPost.mock.invocationCallOrder[0]
        expect(blueskyOrder).toBeLessThan(twitterOrder)
    })

    it('API投稿（Bluesky等）が成功した場合、Successメッセージがタブに送信されること', async () => {
        const recipients: PostMessageState[] = [
            { type: 'Posting', recipient: 'Bluesky' }
        ]
        const successURL = 'https://bsky.app/post/123'
        mockPost.mockResolvedValue(successURL)

        await service.deliver(dummyPost, recipients, dummyPref, mockTabID)

        expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(mockTabID, {
            type: 'Success',
            recipient: 'Bluesky',
            url: successURL
        })
    })

    it('UI投稿（Twitter）の場合、DeliveryServiceからはSuccessメッセージを送信しないこと（UI操作に委譲するため）', async () => {
        const recipients: PostMessageState[] = [
            { type: 'Posting', recipient: 'Twitter' }
        ]
        mockTwitterPost.mockResolvedValue('Twitter UI Triggered')

        await service.deliver(dummyPost, recipients, dummyPref, mockTabID)

        expect(mockTwitterPost).toHaveBeenCalled()
        expect(chrome.tabs.sendMessage).not.toHaveBeenCalled()
    })

    it('投稿処理が失敗した場合、Errorメッセージがタブに送信されること', async () => {
        const recipients: PostMessageState[] = [
            { type: 'Posting', recipient: 'Bluesky' }
        ]
        const errorMsg = 'Network Error'
        mockPost.mockRejectedValue(new Error(errorMsg))

        await service.deliver(dummyPost, recipients, dummyPref, mockTabID)

        expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(mockTabID, {
            type: 'Error',
            recipient: 'Bluesky',
            error: errorMsg
        })
    })

    it('Blueskyが失敗しても、Twitterの処理は続行されるべき', async () => {
        const recipients: PostMessageState[] = [
            { type: 'Posting', recipient: 'Twitter' },
            { type: 'Posting', recipient: 'Bluesky' }
        ]

        mockPost.mockRejectedValue(new Error('Bluesky API Error'))
        mockTwitterPost.mockResolvedValue('Twitter UI Triggered')

        await service.deliver(dummyPost, recipients, dummyPref, mockTabID)

        // Blueskyが失敗してもTwitterは呼ばれること
        expect(mockTwitterPost).toHaveBeenCalled()

        // Blueskyのエラーがタブに送信されていること
        expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(mockTabID, {
            type: 'Error',
            recipient: 'Bluesky',
            error: 'Bluesky API Error'
        })
    })

    it('Blueskyの処理完了後にTwitterが処理されること（直列実行の順序保証）', async () => {
        const callOrder: string[] = []

        mockPost.mockImplementation(async () => {
            callOrder.push('bluesky-start')
            // Blueskyの処理が時間を要することを模倣
            await new Promise(resolve => setTimeout(resolve, 10))
            callOrder.push('bluesky-end')
            return 'https://bsky.app/post/123'
        })

        mockTwitterPost.mockImplementation(async () => {
            callOrder.push('twitter-start')
            return 'Twitter UI Triggered'
        })

        const recipients: PostMessageState[] = [
            { type: 'Posting', recipient: 'Twitter' },
            { type: 'Posting', recipient: 'Bluesky' }
        ]

        await service.deliver(dummyPost, recipients, dummyPref, mockTabID)

        // Blueskyが完全に終了してからTwitterが開始されるべき
        expect(callOrder).toEqual([
            'bluesky-start',
            'bluesky-end',
            'twitter-start',
        ])
    })
})
