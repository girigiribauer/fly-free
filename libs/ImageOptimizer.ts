import { Jimp } from '~/libs/JimpCustom'

import { type PostImage } from '~/models/PostImage'
import { MAX_IMAGE_SIZE, MAX_IMAGE_DIMENSION } from '~/libs/Constants'

interface ResizableImage {
    resize(opts: { w: number; h: number }): void
}

export const optimizePostImage = async (
    image: PostImage,
    targetSize: number = MAX_IMAGE_SIZE,
): Promise<PostImage> => {

    // Skip optimization if already within limits
    if (
        image.filesize <= targetSize &&
        image.width <= MAX_IMAGE_DIMENSION &&
        image.height <= MAX_IMAGE_DIMENSION
    ) {
        return image
    }

    // Load image with jimp (using ArrayBuffer)
    // slice() creates a copy to ensure we have a clean ArrayBuffer of just this image
    const jimpImage = await Jimp.read(Buffer.from(image.binary.slice().buffer))

    // Step 1: Resize to MAX_IMAGE_DIMENSION if needed (maintaining aspect ratio)
    const maxDimension = Math.max(jimpImage.bitmap.width, jimpImage.bitmap.height)
    if (maxDimension > MAX_IMAGE_DIMENSION) {
        const scale = MAX_IMAGE_DIMENSION / maxDimension
            // Cast to custom interface to support object-based resize plugin
            ; (jimpImage as unknown as ResizableImage).resize({
                w: Math.floor(jimpImage.bitmap.width * scale),
                h: Math.floor(jimpImage.bitmap.height * scale),
            })
    }

    // Step 2: Binary search for optimal quality (matching official Bluesky client)
    let minQuality = 1
    let maxQuality = 101 // exclusive
    let bestResult: { buffer: Uint8Array; quality: number } | null = null

    while (maxQuality - minQuality > 1) {
        const quality = Math.round((minQuality + maxQuality) / 2)

        // jimpImage.quality(quality)
        const buffer = await jimpImage.getBuffer('image/jpeg', { quality } as any)

        if (buffer.length <= targetSize) {
            minQuality = quality
            bestResult = { buffer: new Uint8Array(buffer), quality }
        } else {
            maxQuality = quality
        }
    }

    if (!bestResult) {
        throw new Error('Unable to compress image to target size')
    }

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
