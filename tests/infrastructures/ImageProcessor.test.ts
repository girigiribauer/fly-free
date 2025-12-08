import { describe, expect, test, vi, beforeEach } from 'vitest'
import { convertImageURL2PostImage } from '~/infrastructures/ImageProcessor'

// Mock dependencies
vi.mock('~/libs/JimpCustom', () => ({
    Jimp: {
        read: vi.fn().mockResolvedValue({
            bitmap: { width: 100, height: 100 }
        })
    }
}))

vi.mock('~/libs/ImageOptimizer', () => ({
    optimizePostImage: vi.fn().mockImplementation((img) => Promise.resolve({
        ...img,
        width: 50,  // Mock optimized size
        height: 50
    }))
}))

// Mock global fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('convertImageURL2PostImage', () => {
    beforeEach(() => {
        vi.clearAllMocks()

        // Setup default fetch mock
        mockFetch.mockResolvedValue({
            blob: async () => ({
                type: 'image/jpeg',
                arrayBuffer: async () => new ArrayBuffer(8)
            })
        })
    })

    test('Should download image and convert to PostImage', async () => {
        const url = 'https://example.com/image.jpg'

        const result = await convertImageURL2PostImage(url)

        expect(mockFetch).toHaveBeenCalledWith(url)
        expect(result).toMatchObject({
            mimetype: 'image/jpeg',
            width: 50,
            height: 50
        })
    })
})
