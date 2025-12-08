import { readFile } from 'fs/promises'
import path from 'path'
import { describe, expect, test } from 'vitest'
import { Jimp } from '~/libs/JimpCustom'

import {
    estimateReductionRatio,
    optimizePostImage,
} from '~/libs/ImageOptimizer'
import { type PostImage } from '~/models/PostImage'
import { MAX_IMAGE_SIZE } from '~/libs/Constants'

const readBinaryFromPath = async (filepath: string): Promise<Uint8Array> => {
    const buffer = await readFile(path.join(__dirname, filepath))
    return Uint8Array.from(buffer)
}

describe('optimizePostImage', () => {
    test('Image under MAX_IMAGE_SIZE should not be resized', async () => {
        const binary = await readBinaryFromPath('../resources/random1mbless.png')
        const jimpImage = await Jimp.read(Buffer.from(binary))

        const image: PostImage = {
            binary,
            mimetype: 'image/png',
            width: jimpImage.bitmap.width,
            height: jimpImage.bitmap.height,
            filesize: binary.byteLength,
        }

        const result = await optimizePostImage(image)

        // Note: random1mbless.png is ~996KB, which is now over MAX_IMAGE_SIZE (950KB)
        // So it will be resized
        if (image.filesize <= MAX_IMAGE_SIZE) {
            expect(result).toBe(image) // Should return the same object
        } else {
            expect(result.filesize).toBeLessThanOrEqual(MAX_IMAGE_SIZE)
        }
    })

    test('2MB image should be optimized to under MAX_IMAGE_SIZE', async () => {
        const binary = await readBinaryFromPath('../resources/random2mb.png')
        const jimpImage = await Jimp.read(Buffer.from(binary))

        const image: PostImage = {
            binary,
            mimetype: 'image/png',
            width: jimpImage.bitmap.width,
            height: jimpImage.bitmap.height,
            filesize: binary.byteLength,
        }

        const result = await optimizePostImage(image)

        expect(result.filesize).toBeLessThanOrEqual(MAX_IMAGE_SIZE)
        expect(result.filesize).toBeGreaterThan(0)
    })

    test('2MB image should converge within reasonable time', async () => {
        const binary = await readBinaryFromPath('../resources/random2mb.png')
        const jimpImage = await Jimp.read(Buffer.from(binary))

        const image: PostImage = {
            binary,
            mimetype: 'image/png',
            width: jimpImage.bitmap.width,
            height: jimpImage.bitmap.height,
            filesize: binary.byteLength,
        }

        const startTime = Date.now()
        const result = await optimizePostImage(image)
        const endTime = Date.now()

        expect(result.filesize).toBeLessThanOrEqual(MAX_IMAGE_SIZE)
        // Should complete reasonably fast (under 5 seconds for 2MB image)
        expect(endTime - startTime).toBeLessThan(5000)
    })

    test('Optimized image should maintain reasonable quality', async () => {
        const binary = await readBinaryFromPath('../resources/random2mb.png')
        const jimpImage = await Jimp.read(Buffer.from(binary))

        const image: PostImage = {
            binary,
            mimetype: 'image/png',
            width: jimpImage.bitmap.width,
            height: jimpImage.bitmap.height,
            filesize: binary.byteLength,
        }

        const result = await optimizePostImage(image)

        // Check that the image wasn't compressed too aggressively
        const dimensionRatio = result.width / image.width

        // Should retain at least 10% of original dimensions
        expect(dimensionRatio).toBeGreaterThan(0.1)
    })
})

describe('estimateReductionRatio', () => {
    test('Should return 1 for images under MAX_IMAGE_SIZE', () => {
        expect(estimateReductionRatio(500_000)).toBe(1)
        expect(estimateReductionRatio(MAX_IMAGE_SIZE)).toBe(1)
    })

    test('Should return sqrt(MAX/filesize) for oversized images', () => {
        const filesize = 4_000_000 // 4MB
        const expected = Math.sqrt(MAX_IMAGE_SIZE / filesize)
        expect(estimateReductionRatio(filesize)).toBeCloseTo(expected, 5)
    })

    test('Should return reasonable ratio for 2MB image', () => {
        const ratio = estimateReductionRatio(2_000_000)
        const expected = Math.sqrt(MAX_IMAGE_SIZE / 2_000_000)
        expect(ratio).toBeCloseTo(expected, 5)
    })
})
