import path from 'path'

import { describe, expect, test } from 'vitest'

import type { Draft } from '~/models/Draft'
import { convertDraft2Post, type Post } from '~/models/Post'
import { ogpSiteImage } from '~/tests/resources/ogpmeSiteImage'

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

  test.skip('Return with link card URL in case "https://ogp.me/" text', async () => {
    const expected: Post = {
      text: 'https://ogp.me/',
      images: [],
      linkcard: {
        url: 'https://ogp.me/',
        thumbnail: {
          binary: ogpSiteImage,
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
    expect(actual.linkcard.url).toStrictEqual(expected.linkcard.url)
    expect(actual.linkcard.thumbnail).toStrictEqual(expected.linkcard.thumbnail)
    expect(actual.linkcard.title).toStrictEqual(expected.linkcard.title)
    expect(actual.linkcard.description).toStrictEqual(
      expected.linkcard.description,
    )
  })

  test.todo('case embed video')
})
