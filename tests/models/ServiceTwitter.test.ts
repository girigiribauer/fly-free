import { describe, expect, test } from 'vitest'

import { createTwitterFrontend } from '~/models/ServiceTwitter'
import { createStore } from '~/tests/mockStore'

describe('createTwitterFrontend / getStatus', () => {
  test('Invalid if no draft', () => {
    const storeTwitter = createStore('Twitter')
    const { getStatus } = createTwitterFrontend(storeTwitter)

    const expected = {
      type: 'Invalid',
      service: 'Twitter',
    }
    const actual = getStatus(undefined)

    expect(actual).toMatchObject(expected)
  })

  test('Paused if paused is true', () => {
    const storeTwitter = createStore('Twitter')
    storeTwitter.data = { ...storeTwitter.data, paused: true }
    const { getStatus } = createTwitterFrontend(storeTwitter)

    const expected = {
      type: 'Paused',
      service: 'Twitter',
    }
    const actual = getStatus({
      text: 'test123',
      imageURLs: [],
      linkcardURL: null,
    })
  })

  test('Invalid if zero characters and no image', () => {
    const storeTwitter = createStore('Twitter')
    const { getStatus } = createTwitterFrontend(storeTwitter)

    const expected = {
      type: 'Invalid',
      service: 'Twitter',
    }
    const actual = getStatus({ text: '', imageURLs: [], linkcardURL: null })

    expect(actual).toMatchObject(expected)
  })

  test('Valid if zero characters and one image', () => {
    const storeTwitter = createStore('Twitter')
    const { getStatus } = createTwitterFrontend(storeTwitter)

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
    const storeTwitter = createStore('Twitter')
    const { getStatus } = createTwitterFrontend(storeTwitter)

    const expected = {
      type: 'Valid',
      service: 'Twitter',
    }
    const actual = getStatus({ text: 'a', imageURLs: [], linkcardURL: null })

    expect(actual).toMatchObject(expected)
  })

  test('Valid if 280 characters and no image', () => {
    const storeTwitter = createStore('Twitter')
    const { getStatus } = createTwitterFrontend(storeTwitter)

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
    const storeTwitter = createStore('Twitter')
    const { getStatus } = createTwitterFrontend(storeTwitter)

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
    const storeTwitter = createStore('Twitter')
    const { getStatus } = createTwitterFrontend(storeTwitter)

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
    const storeTwitter = createStore('Twitter')
    const { getStatus } = createTwitterFrontend(storeTwitter)

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

  test.todo('case long URL')
})
