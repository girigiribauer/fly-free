import { afterAll, beforeAll, describe, expect, test } from 'vitest'

import type { Preference } from '~/models/Preference'
import { load, PreferenceDefaults, save } from '~/models/Store'

describe('load', () => {
  beforeAll(async () => {
    await chrome.storage.local.clear()
  })

  afterAll(async () => {
    await chrome.storage.local.clear()
  })

  test('saving values are same to loading values', async () => {
    const expected = {
      test123: {
        string: 'foobar',
        array: [0, 1, 2],
        object: { foo: 'bar' },
      },
    }
    await chrome.storage.local.set(expected)
    const actual = await chrome.storage.local.get(['test123'])

    expect(actual).toStrictEqual(expected)
  })

  test('Initial load is Default values', async () => {
    const expected: Preference = PreferenceDefaults
    const actual = await load()

    expect(actual).toStrictEqual(expected)
  })

  test('After saving values are saved values', async () => {
    const expected: Preference = {
      ...PreferenceDefaults,
      twitterPaused: true, // edited
    }
    await save(expected)
    const actual = await load()

    expect(actual).toStrictEqual(expected)
  })
})
