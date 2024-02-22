import { readFile } from 'fs/promises'
import path from 'path'
import { http, HttpHandler, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest'

import { parse, type OpenGraph } from '~/models/OpenGraph'

const mockURLs = [
  { url: 'https://ogp.me/', file: '../resources/ogp_me.html' },
  { url: 'http://example.com/', file: '../resources/example_com.html' },
  { url: 'http://localhost/404', file: null },
]

describe('parse', () => {
  // mock html page with og:image
  const resourceHandlers = mockURLs.map(({ url, file }) =>
    http.get(url, async () => {
      if (!file) {
        return new HttpResponse(null, {
          status: 404,
          statusText: 'Not Found',
        })
      }

      let buffer: string | Buffer
      try {
        buffer = await readFile(path.join(__dirname, file), 'utf8')
      } catch (e) {
        console.error(`mock failed ${e}`)
        return new HttpResponse(null, {
          status: 404,
          statusText: 'Not Found',
        })
      }

      return new HttpResponse(buffer.toString(), {
        headers: {
          'Content-Type': 'text/html',
        },
      })
    }),
  )

  const resourceServer = setupServer(...resourceHandlers)

  beforeAll(() => {
    resourceServer.listen()
  })

  afterEach(() => {
    resourceServer.resetHandlers()
  })

  afterAll(() => {
    resourceServer.close()
  })

  test('https://ogp.me/ returns https://ogp.me/logo.png', async () => {
    const expected = {
      title: 'The Open Graph protocol',
      description:
        'The Open Graph protocol enables any web page to become a rich object in a social graph.',
      ogImage: 'https://ogp.me/logo.png',
      url: 'https://ogp.me/',
    }
    const actual: OpenGraph | null = await parse('https://ogp.me/')

    expect(actual).toStrictEqual(expected)
  })

  test('http://example.com/ returns null', async () => {
    const expected = null
    const actual: OpenGraph | null = await parse('http://example.com/')

    expect(actual).toStrictEqual(expected)
  })

  test('404 URL returns null', async () => {
    const expected = null
    const actual: OpenGraph | null = await parse('http://localhost/404')

    expect(actual).toStrictEqual(expected)
  })

  test.todo('case not UTF-8 (avoid garbled text)')
})
