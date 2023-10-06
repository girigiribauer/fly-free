import { describe, expect, test } from 'vitest'

import { pickupLinkcardURL } from '~/models/Draft'

describe('pickupLinkcardURL', () => {
  test('Return yahoo link in case "https://www.yahoo.co.jp/" text and "yahoo.co.jp" domain', () => {
    const expected = 'https://www.yahoo.co.jp/'

    const text = 'https://www.yahoo.co.jp/'
    const domain = 'yahoo.co.jp'
    const actual = pickupLinkcardURL(text, domain)

    expect(actual).toBe(expected)
  })

  test('Return yahoo weather link in case "https://www.yahoo.co.jp/ https://weather.yahoo.co.jp/weather/" text and "weather.yahoo.co.jp" domain', () => {
    const expected = 'https://weather.yahoo.co.jp/weather/'

    const text = 'https://www.yahoo.co.jp/ https://weather.yahoo.co.jp/weather/'
    const domain = 'weather.yahoo.co.jp'
    const actual = pickupLinkcardURL(text, domain)

    expect(actual).toBe(expected)
  })

  test('Return null in case "https://www.yahoo.co.jp/" text but domain is nothing', () => {
    const expected = null

    const text = 'https://www.yahoo.co.jp/'
    const domain = ''
    const actual = pickupLinkcardURL(text, domain)

    expect(actual).toBe(expected)
  })
})
