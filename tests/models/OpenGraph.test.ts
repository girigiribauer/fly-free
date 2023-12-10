import { describe, expect, test } from 'vitest'

import { parse, type OpenGraph } from '~/models/OpenGraph'

describe('parse', () => {
  test('Return parsed OpenGraph Object in case https://ogp.me/', async () => {
    const expected = {
      title: 'The Open Graph protocol',
      description:
        'The Open Graph protocol enables any web page to become a rich object in a social graph.',
      ogImage: 'https://ogp.me/logo.png',
      url: 'https://ogp.me/',
    }
    const actual: OpenGraph | null = await parse('https://ogp.me/')

    expect(actual).toStrictEqual(expected)
  })

  test('Return null in case invalid URL', async () => {
    const expected = null
    const actual: OpenGraph | null = await parse('aaa')

    expect(actual).toStrictEqual(expected)
  })

  test.todo('case not UTF-8 (avoid garbled text)')
})
