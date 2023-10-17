import { describe, expect, test } from 'vitest'

import { createTwitter } from '~/models/frontend/ServiceTwitter'
import { createStoreTwitter } from '~/tests/mockStoreTwitter'

describe('createTwitter / getStatus', () => {
  test('Invalid if no draft', () => {
    const storeTwitter = createStoreTwitter()
    const { getStatus } = createTwitter(storeTwitter)

    const expected = {
      type: 'Invalid',
      service: 'Twitter',
    }
    const actual = getStatus(undefined)

    expect(actual).toMatchObject(expected)
  })

  test('Paused if paused is true', () => {
    const storeTwitter = createStoreTwitter()
    storeTwitter.data = { ...storeTwitter.data, paused: true }
    const { getStatus } = createTwitter(storeTwitter)

    const expected = {
      type: 'Paused',
      service: 'Twitter',
    }
    const actual = getStatus({
      text: 'test123',
      imageURLs: [],
      linkcardURL: null,
    })

    expect(actual).toMatchObject(expected)
  })

  test('Invalid if zero characters and no image', () => {
    const storeTwitter = createStoreTwitter()
    const { getStatus } = createTwitter(storeTwitter)

    const expected = {
      type: 'Invalid',
      service: 'Twitter',
    }
    const actual = getStatus({ text: '', imageURLs: [], linkcardURL: null })

    expect(actual).toMatchObject(expected)
  })

  test('Valid if zero characters and one image', () => {
    const storeTwitter = createStoreTwitter()
    const { getStatus } = createTwitter(storeTwitter)

    const expected = {
      type: 'Valid',
      service: 'Twitter',
    }
    const actual = getStatus({
      text: '',
      imageURLs: ['https://ogp.me/logo.png'],
      linkcardURL: null,
    })

    expect(actual).toMatchObject(expected)
  })

  test('Valid if one character and no image', () => {
    const storeTwitter = createStoreTwitter()
    const { getStatus } = createTwitter(storeTwitter)

    const expected = {
      type: 'Valid',
      service: 'Twitter',
    }
    const actual = getStatus({ text: 'a', imageURLs: [], linkcardURL: null })

    expect(actual).toMatchObject(expected)
  })

  test('Valid if 280 characters and no image', () => {
    const storeTwitter = createStoreTwitter()
    const { getStatus } = createTwitter(storeTwitter)

    const expected = {
      type: 'Valid',
      service: 'Twitter',
    }
    const actual = getStatus({
      text: Array.from({ length: 280 }, () => 'a').join(''),
      imageURLs: [],
      linkcardURL: null,
    })

    expect(actual).toMatchObject(expected)
  })

  test('Invalid if 281 characters and no image', () => {
    const storeTwitter = createStoreTwitter()
    const { getStatus } = createTwitter(storeTwitter)

    const expected = {
      type: 'Invalid',
      service: 'Twitter',
    }
    const actual = getStatus({
      text: Array.from({ length: 281 }, () => 'a').join(''),
      imageURLs: [],
      linkcardURL: null,
    })

    expect(actual).toMatchObject(expected)
  })

  test('Invalid if 140 multibyte characters and no image', () => {
    const storeTwitter = createStoreTwitter()
    const { getStatus } = createTwitter(storeTwitter)

    const expected = {
      type: 'Valid',
      service: 'Twitter',
    }
    const actual = getStatus({
      text: Array.from({ length: 140 }, () => 'あ').join(''),
      imageURLs: [],
      linkcardURL: null,
    })

    expect(actual).toMatchObject(expected)
  })

  test('Invalid if 141 multibyte characters and no image', () => {
    const storeTwitter = createStoreTwitter()
    const { getStatus } = createTwitter(storeTwitter)

    const expected = {
      type: 'Invalid',
      service: 'Twitter',
    }
    const actual = getStatus({
      text: Array.from({ length: 141 }, () => 'あ').join(''),
      imageURLs: [],
      linkcardURL: null,
    })

    expect(actual).toMatchObject(expected)
  })

  test('Off if enabled is false', () => {
    const storeTwitter = createStoreTwitter()
    const updatedStoreTwitter = {
      ...storeTwitter,
      data: {
        ...storeTwitter.data,
        enabled: false,
      },
    }
    const { getStatus } = createTwitter(updatedStoreTwitter)

    const expected = {
      type: 'Off',
      service: 'Twitter',
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
      const { getStatus } = createTwitter(undefined)
      getStatus({
        text: 'test123',
        imageURLs: [],
        linkcardURL: null,
      })
    }).toThrowError(new Error('Store is nothing'))
  })

  test.todo('case long URL')
})
