import { describe, expect, test } from 'vitest'

import type { Preference } from '~/models/Preference'
import { checkValidation } from '~/services/Taittsuu'

describe('checkValidation', () => {
  const pref: Preference = {
    twitterEnabled: true,
    twitterPaused: false,
    blueskyEnabled: true,
    blueskyPaused: false,
    blueskyUsername: 'xxx',
    blueskyPassword: 'xxx',
  }

  test('Paused in any case', () => {
    const expected = {
      type: 'Invalid',
      errors: ['unimplemented'],
    }
    const actual = checkValidation(
      {
        text: 'taittsuu test123',
        imageURLs: [],
        linkcardURL: null,
      },
      pref,
    )

    expect(actual).toStrictEqual(expected)
  })
})

describe('post', () => {
  test.todo('here')
})
