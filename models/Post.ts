import * as Promise from 'bluebird'

import type { Draft } from '~/models/Draft'
import { parse } from '~/models/OpenGraph'
import { convertImageURL2PostImage } from '~/models/PostImage'
import type { PostImage } from '~/models/PostImage'
import type { PostLinkcard } from '~/models/PostLinkcard'

export type Post = {
  text: string
  images: PostImage[]
  linkcard: PostLinkcard | null
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
  }

  return {
    text,
    images,
    linkcard,
  }
}
