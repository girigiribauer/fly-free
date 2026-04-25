import { BskyAgent, ComAtprotoRepoUploadBlob, RichText, ComAtprotoRepoCreateRecord } from '@atproto/api'
import type { Record } from '@atproto/api/dist/client/types/app/bsky/feed/post'
import * as Promise from 'bluebird'

import { TIDGenerator } from '~/libs/TIDGenerator'
import { fetchWithTimeout } from '~/libs/FetchUtil'
import type { Post } from '~/models/Post'
import type { PostImage } from '~/models/PostImage'
import type { Preference } from '~/models/Preference'

/**
 * Convert Bluesky AT Protocol URI to bsky.app URL
 */
const convertBskyAppURL = (uri: string, username: string): string | null => {
    const matched = uri
        .toLowerCase()
        .match(/at:\/\/did:plc:[a-z0-9]+\/app\.bsky\.feed\.post\/([a-z0-9]+)/)
    if (matched.length < 2) {
        return null
    }
    return `https://bsky.app/profile/${username}/post/${matched[1]}`
}

/**
 * Post to Bluesky using AT Protocol API
 * @param post - Post content
 * @param pref - User preferences (contains credentials)
 * @returns URL of the posted content
 */
export const postToBluesky = async (
    post: Post,
    pref: Preference,
): Promise<string> => {
    const { text, images, linkcard } = post
    const { blueskyUsername: username, blueskyPassword: password } = pref

    const agent = new BskyAgent({
        service: 'https://bsky.social',
        // @ts-ignore - The type definition might be strict, but standard AtpAgent accepts fetch
        fetch: fetchWithTimeout
    })
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
                images: uploadResponses.map((uploadResponse, index) => {
                    const image = images[index]
                    return {
                        // TODO: customize Twitter UI
                        alt: '',
                        image: uploadResponse.data.blob,
                        aspectRatio: {
                            width: image.width,
                            height: image.height,
                        },
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

    const rkey = TIDGenerator.next()
    const repo = loginResponse.data.did

    const postRecord = async () => {
        const response = await agent.api.com.atproto.repo.createRecord({
            repo,
            collection: 'app.bsky.feed.post',
            rkey,
            record: {
                ...postContent,
                createdAt: new Date().toISOString(),
            },
        })
        return response.data
    }

    let result: ComAtprotoRepoCreateRecord.OutputSchema

    try {
        result = await postRecord()
    } catch (error: any) {
        if (error.status === 400 && error.message.includes('Record already exists')) {
            return convertBskyAppURL(`at://${repo}/app.bsky.feed.post/${rkey}`, username)
        }

        try {
            result = await postRecord()
        } catch (retryError: any) {
            if (retryError.status === 400 && retryError.message.includes('Record already exists')) {
                return convertBskyAppURL(`at://${repo}/app.bsky.feed.post/${rkey}`, username)
            }

            throw retryError
        }
    }

    return convertBskyAppURL(result.uri, username)
}
