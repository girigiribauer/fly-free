import { describe, expect, test, vi } from 'vitest'

import { debounce } from '~/libs/debounce'

describe('debounce', () => {
  const sleep = async (ms: number) =>
    new Promise<void>((r) => {
      setTimeout(r, ms)
    })

  test('Call only once', async () => {
    const callback = vi.fn()
    const debouncedFunc = debounce(callback)

    for (let i = 0; i < 10; i++) {
      debouncedFunc()
    }

    await sleep(300)

    expect(callback).toHaveBeenCalledTimes(1)
  })

  test('Call debounced one and undebounced one', async () => {
    const callback = vi.fn()
    const debouncedFunc = debounce(callback, 100)

    debouncedFunc()
    await sleep(50)
    debouncedFunc() // debounced call
    await sleep(150)
    debouncedFunc() // undebounced call

    await sleep(300)

    expect(callback).toHaveBeenCalledTimes(2)
  })
})
