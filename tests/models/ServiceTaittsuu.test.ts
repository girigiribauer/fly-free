import { describe, expect, test } from 'vitest'

import { createTaittsuuFrontend } from '~/models/ServiceTaittsuu'
import { createStore } from '~/tests/mockStore'

describe('createTaittsuuFrontend / getStatus', () => {
  test('Paused in any case', () => {
    const storeTaittsuu = createStore('Taittsuu')
    const { getStatus } = createTaittsuuFrontend(storeTaittsuu)

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
})
