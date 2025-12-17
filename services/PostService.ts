import * as Promise from 'bluebird'

import { convertImageURL2PostImage } from '~/infrastructures/ImageProcessor'
import { fetchOpenGraph as parse } from '~/infrastructures/OpenGraphRepository'
import type { Draft } from '~/models/Draft'
import type { Post } from '~/models/Post'

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
        try {
            const result = await parse(linkcardURL)
            if (result && result.ogImage) {
                const thumbnail = await convertImageURL2PostImage(result.ogImage)

                linkcard = {
                    url: result.url,
                    thumbnail,
                    title: result.title,
                    description: result.description,
                }
            }
        } catch (error) {
            console.warn(`Failed to process OGP for ${linkcardURL}, falling back to text-only link.`, error)
        }
    }

    return {
        text,
        images,
        linkcard,
    }
}
