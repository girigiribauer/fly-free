import { describe, expect, test } from 'vitest'

import { pickupLinkcardURL } from '~/models/Draft'

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
