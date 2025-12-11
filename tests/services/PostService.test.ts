import { describe, expect, test, vi } from 'vitest'

import type { Draft } from '~/models/Draft'
import type { Post } from '~/models/Post'
import { convertDraft2Post } from '~/services/PostService'

// Define hoisted mocks to avoid ReferenceError
const mocks = vi.hoisted(() => ({
  dummyImage: new Uint8Array([1, 2, 3]),
}))

// Mock dependencies with hoisted values
vi.mock('~/infrastructures/OpenGraphRepository', () => ({
  fetchOpenGraph: vi.fn().mockResolvedValue({
    url: 'https://ogp.me/',
    title: 'The Open Graph protocol',
    description: 'The Open Graph protocol enables any web page to become a rich object in a social graph.',
    ogImage: 'https://ogp.me/logo.png',
  }),
}))

vi.mock('~/infrastructures/ImageProcessor', () => ({
  convertImageURL2PostImage: vi.fn().mockResolvedValue({
    binary: mocks.dummyImage,
    mimetype: 'image/png',
    width: 300,
    height: 300,
    filesize: 12379,
  }),
}))

describe('convertDraft2Post', () => {
  test('Convert directly in case regular text', async () => {
    const expected: Post = {
      text: 'test123',
      images: [],
      linkcard: null,
    }

    const draft: Draft = {
      text: 'test123',
      imageURLs: [],
      linkcardURL: null,
    }
    const actual = await convertDraft2Post(draft)

    expect(actual).toStrictEqual(expected)
  })

  test('Return with link card URL in case "https://ogp.me/" text', async () => {
    const expected: Post = {
      text: 'https://ogp.me/',
      images: [],
      linkcard: {
        url: 'https://ogp.me/',
        thumbnail: {
          binary: mocks.dummyImage,
          mimetype: 'image/png',
          width: 300,
          height: 300,
          filesize: 12379,
        },
        title: 'The Open Graph protocol',
        description:
          'The Open Graph protocol enables any web page to become a rich object in a social graph.',
      },
    }

    const draft: Draft = {
      text: 'https://ogp.me/',
      imageURLs: [],
      linkcardURL: 'https://ogp.me/',
    }
    const actual = await convertDraft2Post(draft)

    expect(actual.text).toStrictEqual(expected.text)
    expect(actual.images).toStrictEqual(expected.images)
    expect(actual.linkcard?.url).toStrictEqual(expected.linkcard?.url)
    expect(actual.linkcard?.thumbnail).toStrictEqual(expected.linkcard?.thumbnail)
    expect(actual.linkcard?.title).toStrictEqual(expected.linkcard?.title)
    expect(actual.linkcard?.description).toStrictEqual(
      expected.linkcard?.description,
    )
  })

  test.todo('case embed video')
})
