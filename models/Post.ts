import * as Promise from 'bluebird'

import type { Draft } from '~/models/Draft'
import { parse } from '~/models/OpenGraph'

export type Post = {
  text: string
  images: PostImage[]
  linkcard: PostLinkcard | null
}

export type PostImage = {
  binary: Uint8Array
  mimetype: string
  size: number
}

export type PostLinkcard = {
  url: string
  thumbnail: PostImage
  title: string
  description: string
}

const convertImageURL2Binary = async (imageURL: string): Promise<PostImage> => {
  const fetchResponse = await fetch(imageURL)
  const blobObject = await fetchResponse.blob()
  const mimetype = blobObject.type
  const binary = new Uint8Array(await blobObject.arrayBuffer())
  const size = binary.byteLength

  return {
    binary,
    mimetype,
    size,
  }
}

export const convertDraft2Post = async (draft: Draft): Promise<Post> => {
  const { text, imageURLs, linkcardURL } = draft

  const images = await Promise.mapSeries(
    imageURLs,
    async (imageURL: string) => {
      return await convertImageURL2Binary(imageURL)
    },
  )

  let linkcard = null
  if (linkcardURL) {
    const result = await parse(linkcardURL)
    if (result && result.ogImage) {
      const thumbnail = await convertImageURL2Binary(result.ogImage)

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
