import { Jimp } from '~/libs/JimpCustom'

import { type PostImage } from '~/models/PostImage'
import { MAX_IMAGE_SIZE } from '~/libs/Constants'

const MAX_DIMENSION = 2000
const MAX_FILE_SIZE = MAX_IMAGE_SIZE // 900KB

interface ResizableImage {
    resize(opts: { w: number; h: number }): void
}

export const optimizePostImage = async (
    image: PostImage,
): Promise<PostImage> => {
    // console.log('[ImageOptimizer] Starting optimization:', { ... })

    // Load image with jimp (using ArrayBuffer)
    // slice() creates a copy to ensure we have a clean ArrayBuffer of just this image
    const jimpImage = await Jimp.read(Buffer.from(image.binary.slice().buffer))

    // Step 1: Resize to 2000px if needed (maintaining aspect ratio)
    const maxDimension = Math.max(jimpImage.bitmap.width, jimpImage.bitmap.height)
    if (maxDimension > MAX_DIMENSION) {
        const scale = MAX_DIMENSION / maxDimension
            // Cast to custom interface to support object-based resize plugin
            ; (jimpImage as unknown as ResizableImage).resize({
                w: Math.floor(jimpImage.bitmap.width * scale),
                h: Math.floor(jimpImage.bitmap.height * scale),
            })
        // console.log('[ImageOptimizer] Step 1 - Resized to 2000px: ...')
    }

    // Step 2: Binary search for optimal quality (matching official Bluesky client)
    let minQuality = 1
    let maxQuality = 101 // exclusive
    let bestResult: { buffer: Uint8Array; quality: number } | null = null

    // console.log('[ImageOptimizer] Step 2 - Finding optimal quality...')

    while (maxQuality - minQuality > 1) {
        const quality = Math.round((minQuality + maxQuality) / 2)

        // jimpImage.quality(quality)
        const buffer = await jimpImage.getBuffer('image/jpeg', { quality } as any)

        // console.log(`[ImageOptimizer] Quality ${quality}%: ...`)

        if (buffer.length <= MAX_FILE_SIZE) {
            minQuality = quality
            bestResult = { buffer: new Uint8Array(buffer), quality }
        } else {
            maxQuality = quality
        }
    }

    if (!bestResult) {
        throw new Error('Unable to compress image to target size')
    }

    // console.log('[ImageOptimizer] Final result: ...')

    return {
        binary: bestResult.buffer,
        mimetype: 'image/jpeg',
        width: jimpImage.bitmap.width,
        height: jimpImage.bitmap.height,
        filesize: bestResult.buffer.length,
    }
}

// Legacy function for compatibility
export const estimateReductionRatio = (filesize: number): number => {
    if (filesize <= MAX_IMAGE_SIZE) {
        return 1
    }
    return Math.sqrt(MAX_IMAGE_SIZE / filesize)
}
