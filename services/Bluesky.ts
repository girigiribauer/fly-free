import { BskyAgent, ComAtprotoRepoUploadBlob, RichText } from '@atproto/api'
import type { Record } from '@atproto/api/dist/client/types/app/bsky/feed/post'
import * as Promise from 'bluebird'

import type { Draft } from '~/models/Draft'
import type { Post, PostImage } from '~/models/Post'
import type { PostValidateState } from '~/models/PostValidateState'
import type { Preference } from '~/models/Preference'

export const checkValidation = (
  draft: Draft,
  pref: Preference,
): PostValidateState => {
  if (!draft) {
    return {
      type: 'Invalid',
      errors: ['no draft'],
    }
  }
  if (pref.blueskyUsername === '' || pref.blueskyPassword === '') {
    return {
      type: 'Invalid',
      errors: ['no username or password'],
    }
  }

  const { text, imageURLs } = draft
  if ((!text || text.length === 0) && (!imageURLs || imageURLs.length === 0)) {
    return {
      type: 'Invalid',
      errors: ['no text'],
    }
  }
  if (text.length > 300) {
    return {
      type: 'Invalid',
      errors: ['parse invalid'],
    }
  }
  // TODO: case embedded video

  return {
    type: 'Valid',
  }
}

const convertBskyAppURL = (uri: string, username: string): string | null => {
  const matched = uri
    .toLowerCase()
    .match(/at:\/\/did:plc:[a-z0-9]+\/app\.bsky\.feed\.post\/([a-z0-9]+)/)
  if (matched.length < 2) {
    return null
  }
  return `https://bsky.app/profile/${username}/post/${matched[1]}`
}

export const post = async (post: Post, pref: Preference): Promise<string> => {
  const { text, images, linkcard } = post
  const { blueskyUsername: username, blueskyPassword: password } = pref

  const agent = new BskyAgent({ service: 'https://bsky.social' })
  const loginResponse = await agent.login({
    identifier: username,
    password,
  })
  if (!loginResponse.success) {
    throw new Error('login failed')
  }

  const rt = new RichText({ text })
  await rt.detectFacets(agent)

  let postContent: Partial<Record> & Omit<Record, 'createdAt'> = {
    text: rt.text,
    facets: rt.facets,
  }

  if (images.length > 0 && !linkcard) {
    const uploadResponses: ComAtprotoRepoUploadBlob.Response[] =
      await Promise.mapSeries(
        images,
        async ({ binary, mimetype }: PostImage) => {
          return await agent.uploadBlob(binary, {
            encoding: mimetype,
          })
        },
      )
    if (!uploadResponses.every((v) => v.success)) {
      throw new Error('upload failed')
    }

    postContent = {
      ...postContent,
      embed: {
        $type: 'app.bsky.embed.images',
        images: uploadResponses.map((uploadResponse) => {
          return {
            // TODO: customize Twitter UI
            alt: '',
            image: uploadResponse.data.blob,
          }
        }),
      },
    }
  } else if (linkcard) {
    const uploadResponse: ComAtprotoRepoUploadBlob.Response =
      await agent.uploadBlob(linkcard.thumbnail.binary, {
        encoding: linkcard.thumbnail.mimetype,
      })
    if (!uploadResponse.success) {
      throw new Error('upload failed')
    }

    postContent = {
      ...postContent,
      embed: {
        $type: 'app.bsky.embed.external',
        external: {
          uri: linkcard.url,
          thumb: {
            $type: 'blob',
            ref: {
              $link: uploadResponse.data.blob.ref.toString(),
            },
            mimeType: uploadResponse.data.blob.mimeType,
            size: uploadResponse.data.blob.size,
          },
          title: linkcard.title,
          description: linkcard.description,
        },
      },
    }
  }

  const result = await agent.post(postContent)
  return convertBskyAppURL(result.uri, username)
}
