import { describe, expect, test } from 'vitest'

import { cleanDraftText, pickupLinkcardURL } from '~/libs/DraftUtils'

describe('pickupLinkcardURL', () => {
  test('Return yahoo link in case "https://www.yahoo.co.jp/" text and "yahoo.co.jp" domain', () => {
    const expected = 'https://www.yahoo.co.jp/'

    const text = 'https://www.yahoo.co.jp/'
    const actual = pickupLinkcardURL(text)

    expect(actual).toBe(expected)
  })

  test('Return the last link in case "https://www.yahoo.co.jp/ https://weather.yahoo.co.jp/weather/" text', () => {
    const expected = 'https://weather.yahoo.co.jp/weather/'

    const text = 'https://www.yahoo.co.jp/ https://weather.yahoo.co.jp/weather/'
    const actual = pickupLinkcardURL(text)

    expect(actual).toBe(expected)
  })
})

describe('cleanDraftText', () => {
  test('Should trim whitespace', () => {
    expect(cleanDraftText('  hello  ')).toBe('hello')
  })

  test('Should remove last line if it matches a URL present in previous lines', () => {
    const text = 'Check this out: https://example.com/page\nhttps://example.com/page'
    const expected = 'Check this out: https://example.com/page'
    expect(cleanDraftText(text)).toBe(expected)
  })

  test('Should NOT remove last line if it is a different URL', () => {
    const text = 'Check this out: https://example.com/page1\nhttps://example.com/page2'
    expect(cleanDraftText(text)).toBe(text)
  })

  test('Should NOT remove last line if it is not a URL', () => {
    const text = 'Line 1\nLine 2'
    expect(cleanDraftText(text)).toBe(text)
  })

  test('Should handle single line text', () => {
    expect(cleanDraftText('hello')).toBe('hello')
  })
})
