import { describe, expect, test } from 'vitest'

import type { Preference } from '~/models/Preference'
import { blueskyValidationRule } from '~/infrastructures/BlueskyValidationRule'
const checkValidation = blueskyValidationRule.validate

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

  test('Valid if 300 characters and no image', () => {
    const actual = checkValidation(
      {
        text: Array.from({ length: 300 }, () => 'a').join(''),
        imageURLs: [],
        linkcardURL: null,
      },
      pref,
    )
    expect(actual).toStrictEqual({
      type: 'Valid',
    })
  })

  test('Invalid if 301 characters and no image', () => {
    const actual = checkValidation(
      {
        text: Array.from({ length: 301 }, () => 'a').join(''),
        imageURLs: [],
        linkcardURL: null,
      },
      pref,
    )
    expect(actual).toStrictEqual({
      type: 'Invalid',
      // The current BlueskyValidationRule returns 'TextTooLong' with maxLength
      errors: [{ type: 'TextTooLong', maxLength: 300 }],
    })
  })

  test('Valid if 300 multibyte characters and no image', () => {
    const actual = checkValidation(
      {
        text: Array.from({ length: 300 }, () => 'あ').join(''),
        imageURLs: [],
        linkcardURL: null,
      },
      pref,
    )
    expect(actual).toStrictEqual({
      type: 'Valid',
    })
  })

  test('Invalid if 301 multibyte characters and no image', () => {
    const actual = checkValidation(
      {
        text: Array.from({ length: 301 }, () => 'あ').join(''),
        imageURLs: [],
        linkcardURL: null,
      },
      pref,
    )
    expect(actual).toStrictEqual({
      type: 'Invalid',
      errors: [{ type: 'TextTooLong', maxLength: 300 }],
    })
  })

  test('Invalid if username, password is empty string', () => {
    const actual = checkValidation(
      {
        text: 'test123',
        imageURLs: [],
        linkcardURL: null,
      },
      Object.assign({}, pref, { blueskyUsername: '' }),
    )
    expect(actual).toStrictEqual({
      type: 'Invalid',
      errors: [{ type: 'NoCredentials' }],
    })
  })

  test.todo('case long URL')
})

describe('post', () => {
  test.todo('here')
})
