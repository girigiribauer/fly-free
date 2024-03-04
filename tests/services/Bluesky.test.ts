import { describe, expect, test } from 'vitest'

import type { Preference } from '~/models/Preference'
import { checkValidation } from '~/services/Bluesky'

describe('checkValidation', () => {
  const pref: Preference = {
    twitterPaused: false,
    blueskyPaused: false,
    blueskyUsername: 'xxx',
    blueskyPassword: 'xxx',
    globalAutoclosing: false,
    globalForceblank: false,
  }

  test('Invalid if no draft', () => {
    const expected = {
      type: 'Invalid',
      errors: ['no draft'],
    }
    const actual = checkValidation(undefined, pref)

    expect(actual).toStrictEqual(expected)
  })

  test('Invalid if zero characters and no image', () => {
    const expected = {
      type: 'Invalid',
      errors: ['no text'],
    }
    const actual = checkValidation(
      { text: '', imageURLs: [], linkcardURL: null },
      pref,
    )

    expect(actual).toStrictEqual(expected)
  })

  test('Valid if zero characters and one image', () => {
    const expected = {
      type: 'Valid',
    }
    const actual = checkValidation(
      {
        text: '',
        imageURLs: ['https://ogp.me/logo.png'],
        linkcardURL: null,
      },
      pref,
    )

    expect(actual).toStrictEqual(expected)
  })

  test('Valid if one character and no image', () => {
    const expected = {
      type: 'Valid',
    }
    const actual = checkValidation(
      { text: 'a', imageURLs: [], linkcardURL: null },
      pref,
    )

    expect(actual).toStrictEqual(expected)
  })

  test('Valid if 300 characters and no image', () => {
    const expected = {
      type: 'Valid',
    }
    const actual = checkValidation(
      {
        text: Array.from({ length: 300 }, () => 'a').join(''),
        imageURLs: [],
        linkcardURL: null,
      },
      pref,
    )

    expect(actual).toStrictEqual(expected)
  })

  test('Invalid if 301 characters and no image', () => {
    const expected = {
      type: 'Invalid',
      errors: ['parse invalid'],
    }
    const actual = checkValidation(
      {
        text: Array.from({ length: 301 }, () => 'a').join(''),
        imageURLs: [],
        linkcardURL: null,
      },
      pref,
    )

    expect(actual).toStrictEqual(expected)
  })

  test('Valid if 300 multibyte characters and no image', () => {
    const expected = {
      type: 'Valid',
    }
    const actual = checkValidation(
      {
        text: Array.from({ length: 300 }, () => 'あ').join(''),
        imageURLs: [],
        linkcardURL: null,
      },
      pref,
    )

    expect(actual).toStrictEqual(expected)
  })

  test('Invalid if 301 multibyte characters and no image', () => {
    const expected = {
      type: 'Invalid',
      errors: ['parse invalid'],
    }
    const actual = checkValidation(
      {
        text: Array.from({ length: 301 }, () => 'あ').join(''),
        imageURLs: [],
        linkcardURL: null,
      },
      pref,
    )

    expect(actual).toStrictEqual(expected)
  })

  test('Invalid if username, password is empty string', () => {
    const expected = {
      type: 'Invalid',
      errors: ['no username or password'],
    }
    const actual = checkValidation(
      {
        text: 'test123',
        imageURLs: [],
        linkcardURL: null,
      },
      Object.assign({}, pref, { blueskyUsername: '' }),
    )

    expect(actual).toStrictEqual(expected)
  })

  test.todo('case long URL')
})

describe('post', () => {
  test.todo('here')
})
