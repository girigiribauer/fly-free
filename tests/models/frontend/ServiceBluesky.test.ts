import { describe, expect, test } from 'vitest'

import { createBluesky } from '~/models/frontend/ServiceBluesky'
import { createStoreBluesky } from '~/tests/mockStoreBluesky'

describe('createBluesky / getStatus', () => {
  test('Invalid if no draft', () => {
    const storeBluesky = createStoreBluesky()
    const { getStatus } = createBluesky(storeBluesky)

    const expected = {
      type: 'Invalid',
      service: 'Bluesky',
    }
    const actual = getStatus(undefined)

    expect(actual).toMatchObject(expected)
  })

  test('Paused if paused is true', () => {
    const storeBluesky = createStoreBluesky()
    storeBluesky.data = { ...storeBluesky.data, paused: true }
    const { getStatus } = createBluesky(storeBluesky)

    const expected = {
      type: 'Paused',
      service: 'Bluesky',
    }
    const actual = getStatus({
      text: 'test123',
      imageURLs: [],
      linkcardURL: null,
    })
  })

  test('Invalid if zero characters and no image', () => {
    const storeBluesky = createStoreBluesky()
    const { getStatus } = createBluesky(storeBluesky)

    const expected = {
      type: 'Invalid',
      service: 'Bluesky',
    }
    const actual = getStatus({ text: '', imageURLs: [], linkcardURL: null })

    expect(actual).toMatchObject(expected)
  })

  test('Valid if zero characters and one image', () => {
    const storeBluesky = createStoreBluesky()
    const { getStatus } = createBluesky(storeBluesky)

    const expected = {
      type: 'Valid',
      service: 'Bluesky',
    }
    const actual = getStatus({
      text: '',
      imageURLs: ['https://ogp.me/logo.png'],
      linkcardURL: null,
    })

    expect(actual).toMatchObject(expected)
  })

  test('Valid if one character and no image', () => {
    const storeBluesky = createStoreBluesky()
    const { getStatus } = createBluesky(storeBluesky)

    const expected = {
      type: 'Valid',
      service: 'Bluesky',
    }
    const actual = getStatus({ text: 'a', imageURLs: [], linkcardURL: null })

    expect(actual).toMatchObject(expected)
  })

  test('Valid if 300 characters and no image', () => {
    const storeBluesky = createStoreBluesky()
    const { getStatus } = createBluesky(storeBluesky)

    const expected = {
      type: 'Valid',
      service: 'Bluesky',
    }
    const actual = getStatus({
      text: Array.from({ length: 300 }, () => 'a').join(''),
      imageURLs: [],
      linkcardURL: null,
    })

    expect(actual).toMatchObject(expected)
  })

  test('Invalid if 301 characters and no image', () => {
    const storeBluesky = createStoreBluesky()
    const { getStatus } = createBluesky(storeBluesky)

    const expected = {
      type: 'Invalid',
      service: 'Bluesky',
    }
    const actual = getStatus({
      text: Array.from({ length: 301 }, () => 'a').join(''),
      imageURLs: [],
      linkcardURL: null,
    })

    expect(actual).toMatchObject(expected)
  })

  test('Valid if 300 multibyte characters and no image', () => {
    const storeBluesky = createStoreBluesky()
    const { getStatus } = createBluesky(storeBluesky)

    const expected = {
      type: 'Valid',
      service: 'Bluesky',
    }
    const actual = getStatus({
      text: Array.from({ length: 300 }, () => 'あ').join(''),
      imageURLs: [],
      linkcardURL: null,
    })

    expect(actual).toMatchObject(expected)
  })

  test('Invalid if 301 multibyte characters and no image', () => {
    const storeBluesky = createStoreBluesky()
    const { getStatus } = createBluesky(storeBluesky)

    const expected = {
      type: 'Invalid',
      service: 'Bluesky',
    }
    const actual = getStatus({
      text: Array.from({ length: 301 }, () => 'あ').join(''),
      imageURLs: [],
      linkcardURL: null,
    })

    expect(actual).toMatchObject(expected)
  })

  test('Invalid if username, password is empty string', () => {
    const storeBluesky = createStoreBluesky()
    const updatedStoreBluesky = {
      ...storeBluesky,
      data: {
        ...storeBluesky.data,
        username: '',
      },
    }
    const { getStatus } = createBluesky(updatedStoreBluesky)

    const expected = {
      type: 'Invalid',
      service: 'Bluesky',
    }
    const actual = getStatus({
      text: 'test123',
      imageURLs: [],
      linkcardURL: null,
    })

    expect(actual).toMatchObject(expected)
  })

  test('Off if enabled is false', () => {
    const storeBluesky = createStoreBluesky()
    const updatedStoreBluesky = {
      ...storeBluesky,
      data: {
        ...storeBluesky.data,
        enabled: false,
      },
    }
    const { getStatus } = createBluesky(updatedStoreBluesky)

    const expected = {
      type: 'Off',
      service: 'Bluesky',
    }
    const actual = getStatus({
      text: 'test123',
      imageURLs: [],
      linkcardURL: null,
    })

    expect(actual).toMatchObject(expected)
  })

  test('Throw error if store is nothing', () => {
    expect(() => {
      const { getStatus } = createBluesky(undefined)
      getStatus({
        text: 'test123',
        imageURLs: [],
        linkcardURL: null,
      })
    }).toThrowError(new Error('Store is nothing'))
  })

  test.todo('case long URL')
})
