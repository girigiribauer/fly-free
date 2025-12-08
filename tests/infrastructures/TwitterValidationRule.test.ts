import { describe, expect, test } from 'vitest'

import type { Preference } from '~/models/Preference'
import { twitterValidationRule } from '~/infrastructures/TwitterValidationRule'
const checkValidation = twitterValidationRule.validate

describe('checkValidation', () => {
  const pref: Preference = {
    twitterPaused: false,
    blueskyPaused: false,
    blueskyUsername: 'xxx',
    blueskyPassword: 'xxx',
    globalAutoclosing: false,

    globalForceblank: false,
    dryRun: false,
  }

  test('Invalid if no draft', () => {
    const actual = checkValidation(undefined, pref)
    expect(actual).toStrictEqual({
      type: 'Invalid',
      errors: [{ type: 'NoDraft' }],
    })
  })

  test('Invalid if zero characters and no image', () => {
    const actual = checkValidation(
      { text: '', imageURLs: [], linkcardURL: null },
      pref,
    )
    expect(actual).toStrictEqual({
      type: 'Invalid',
      errors: [{ type: 'NoText' }],
    })
  })

  test('Valid if zero characters and one image', () => {
    const actual = checkValidation(
      {
        text: '',
        imageURLs: ['https://ogp.me/logo.png'],
        linkcardURL: null,
      },
      pref,
    )
    expect(actual).toStrictEqual({
      type: 'Valid',
    })
  })

  test('Valid if one character and no image', () => {
    const actual = checkValidation(
      { text: 'a', imageURLs: [], linkcardURL: null },
      pref,
    )
    expect(actual).toStrictEqual({
      type: 'Valid',
    })
  })

  test('Valid if 280 characters and no image', () => {
    const actual = checkValidation(
      {
        text: Array.from({ length: 280 }, () => 'a').join(''),
        imageURLs: [],
        linkcardURL: null,
      },
      pref,
    )
    expect(actual).toStrictEqual({
      type: 'Valid',
    })
  })

  test('Invalid if 281 characters and no image', () => {
    const actual = checkValidation(
      {
        text: Array.from({ length: 281 }, () => 'a').join(''),
        imageURLs: [],
        linkcardURL: null,
      },
      pref,
    )
    expect(actual).toStrictEqual({
      type: 'Invalid',
      errors: [{ type: 'ParseInvalid' }],
    })
  })

  test('Invalid if 140 multibyte characters and no image', () => {
    const actual = checkValidation(
      {
        text: Array.from({ length: 140 }, () => 'あ').join(''),
        imageURLs: [],
        linkcardURL: null,
      },
      pref,
    )
    expect(actual).toStrictEqual({
      type: 'Valid',
    })
  })

  test('Invalid if 141 multibyte characters and no image', () => {
    const actual = checkValidation(
      {
        text: Array.from({ length: 141 }, () => 'あ').join(''),
        imageURLs: [],
        linkcardURL: null,
      },
      pref,
    )
    expect(actual).toStrictEqual({
      type: 'Invalid',
      errors: [{ type: 'ParseInvalid' }],
    })
  })

  test.todo('case long URL')
})

describe('post', () => {
  test.todo('here')
})
