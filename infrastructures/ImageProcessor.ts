import * as Promise from 'bluebird'

import { fetchImageFromURL } from '~/infrastructures/ImageRepository'
import { optimizePostImage } from '~/libs/ImageOptimizer'
import { Jimp } from '~/libs/JimpCustom'
import type { PostImage } from '~/models/PostImage'

export const convertImageURL2PostImage = async (
    imageURL: string,
): Promise<PostImage> => {
    const binary = await fetchImageFromURL(imageURL)
    const fetchResponse = await fetch(imageURL)
    const blobObject = await fetchResponse.blob()
    const mimetype = blobObject.type
    const filesize = binary.byteLength

    // Use jimp to get dimensions (using ArrayBuffer)
    const jimpImage = await Jimp.read(binary.slice().buffer)
    const dimensions = {
        width: jimpImage.bitmap.width,
        height: jimpImage.bitmap.height
    }

    const image = {
        binary,
        mimetype,
        width: dimensions.width,
        height: dimensions.height,
        filesize,
    }

    const resized = await optimizePostImage(image)

    return resized
}
