import { describe, expect, test } from 'vitest'

import { createTaittsuu } from '~/models/frontend/ServiceTaittsuu'
import { createStoreTaittsuu } from '~/tests/mockStoreTaittsuu'

describe('createTaittsuu / getStatus', () => {
  test('Paused in any case', () => {
    const storeTaittsuu = createStoreTaittsuu()
    const { getStatus } = createTaittsuu(storeTaittsuu)

    const expected = {
      type: 'Paused',
      service: 'Taittsuu',
    }
    const actual = getStatus({
      text: 'taittsuu test123',
      imageURLs: [],
      linkcardURL: null,
    })

    expect(actual).toMatchObject(expected)
  })

  test('Throw error if store is nothing', () => {
    expect(() => {
      const { getStatus } = createTaittsuu(undefined)
      getStatus({
        text: 'test123',
        imageURLs: [],
        linkcardURL: null,
      })
    }).toThrowError(new Error('Store is nothing'))
  })
})
