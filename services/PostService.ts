import * as Promise from 'bluebird'

import type { Draft } from '~/models/Draft'
import { fetchOpenGraph } from '~/infrastructures/OpenGraphRepository'
import type { Post } from '~/models/Post'
import type { PostImage } from '~/models/PostImage'
import { fetchImageFromURL } from '~/infrastructures/ImageRepository'
import { optimizePostImage } from '~/libs/ImageOptimizer'
import { Jimp } from '~/libs/JimpCustom'

const convertImageURL2PostImage = async (
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

export const convertDraft2Post = async (draft: Draft): Promise<Post> => {
    const { text, imageURLs, linkcardURL } = draft

    const images = await Promise.mapSeries(
        imageURLs,
        async (imageURL: string) => {
            return await convertImageURL2PostImage(imageURL)
        },
    )

    let linkcard = null
    if (linkcardURL) {
        const result = await fetchOpenGraph(linkcardURL)
        if (result && result.ogImage) {
            const thumbnail = await convertImageURL2PostImage(result.ogImage)

            linkcard = {
                url: result.url,
                thumbnail,
                title: result.title,
                description: result.description,
            }
        }
    }

    return {
        text,
        images,
        linkcard,
    }
}
