import { readFile } from 'fs/promises'
import path from 'path'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest'

import { parse, type OpenGraph } from '~/models/OpenGraph'

const mockURLs = [
  { url: 'https://ogp.me/', file: '../resources/ogp_me.html' },
  { url: 'http://example.com/', file: '../resources/example_com.html' },
  {
    url: 'https://automaton-media.com/articles/newsjp/20240201-280875/',
    file: '../resources/automaton-media_com.html',
  },
  { url: 'https://openai.com/sora', file: '../resources/openai_com.html' },
  {
    url: 'https://www.joshwcomeau.com/animation/a-friendly-introduction-to-spring-physics/',
    file: '../resources/joshwcomeau_com.html',
  },
  // TODO: Two tests failure #6
  // {
  //   url: 'https://www.itmedia.co.jp/',
  //   file: '../resources/itmedia_co_jp.html',
  // },
  // {
  //   url: 'https://news.livedoor.com',
  //   file: '../resources/news_livedoor_com.html',
  // },
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
        buffer = await readFile(path.join(__dirname, file), {
          encoding: 'utf8',
        })
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
      title: 'Open Graph protocol',
      description:
        'The Open Graph protocol enables any web page to become a rich object in a social graph.',
      ogImage: 'https://ogp.me/logo.png',
      url: 'https://ogp.me/',
    }
    const actual: OpenGraph | null = await parse('https://ogp.me/')

    expect(actual).toStrictEqual(expected)
  })

  test('http://example.com/ (no og:image) returns null', async () => {
    const expected = null
    const actual: OpenGraph | null = await parse('http://example.com/')

    expect(actual).toStrictEqual(expected)
  })

  test('https://automaton-media.com (2 og:image) returns one og:image object', async () => {
    const expected = {
      title:
        '『デス・ストランディング2 ON THE BEACH』正式発表、2025年発売へ。“月”や復活したヒッグス、ルーを巡る謎深まる新映像公開 - AUTOMATON',
      description:
        'KOJIMA PRODUCTIONSは2月1日、『DEATH STRANDING 2 ON THE BEACH』を正式発表した。PS5向けに2025年発売予定。',
      ogImage:
        'https://automaton-media.com/wp-content/uploads/2024/02/20240201-280875-header.jpg',
      url: 'https://automaton-media.com/articles/newsjp/20240201-280875/',
    }
    const actual: OpenGraph | null = await parse(
      'https://automaton-media.com/articles/newsjp/20240201-280875/',
    )

    expect(actual).toStrictEqual(expected)
  })

  test('https://openai.com/sora returns https://images.openai.com/blob/8264d3d7-922c-4343-b43d-6665e44bcb91/paper-airplanes.jpg?trim=0%2C0%2C0%2C0&width=1000&quality=80', async () => {
    const expected = {
      title: 'Sora: Creating video from text',
      description: '',
      ogImage:
        'https://images.openai.com/blob/8264d3d7-922c-4343-b43d-6665e44bcb91/paper-airplanes.jpg?trim=0%2C0%2C0%2C0&width=1000&quality=80',
      url: 'https://openai.com/sora',
    }
    const actual: OpenGraph | null = await parse('https://openai.com/sora')

    expect(actual).toStrictEqual(expected)
  })

  test('https://www.joshwcomeau.com/animation/a-friendly-introduction-to-spring-physics/ returns https://www.joshwcomeau.com/images/og-a-friendly-introduction-to-spring-physics.png', async () => {
    const expected = {
      title: 'A Friendly Introduction to Spring Physics',
      description:
        "Of all the little tips and techniques I've picked up over the years about animation, spring physics remains one of the most powerful and flexible. In this tutorial, we'll learn how to harness their power to build fluid, organic transitions.",
      ogImage:
        'https://www.joshwcomeau.com/images/og-a-friendly-introduction-to-spring-physics.png',
      url: 'https://www.joshwcomeau.com/animation/a-friendly-introduction-to-spring-physics/',
    }
    const actual: OpenGraph | null = await parse(
      'https://www.joshwcomeau.com/animation/a-friendly-introduction-to-spring-physics/',
    )

    expect(actual).toStrictEqual(expected)
  })

  test.skip('https://www.itmedia.co.jp/ (Shift_JIS) returns without garbled characters', async () => {
    const expected = {
      title: 'IT総合情報ポータル「ITmedia」Home',
      description:
        'テクノロジー関連のニュース及び速報を中心に、レビューや特集記事を掲載。',
      ogImage:
        'https://image.itmedia.co.jp/images/logo/1200x630_500x500_top.gif',
      url: 'https://www.itmedia.co.jp/',
    }
    const actual: OpenGraph | null = await parse('https://www.itmedia.co.jp/')

    expect(actual).toStrictEqual(expected)
  })

  test.skip('https://news.livedoor.com (EUC-JP) returns without garbled characters', async () => {
    const expected = {
      title: 'ライブドアニュース（livedoor ニュース）',
      description:
        'ライブドアニュースは、幅広いジャンルのニュースをいち早くお伝えします。わかりやすさ、読みやすさにこだわり、記事の核心をまとめた要約をつけています。',
      ogImage: 'https://news.livedoor.com/img/fb/news.png?v=3.00',
      url: 'https://news.livedoor.com/',
    }
    const actual: OpenGraph | null = await parse('https://news.livedoor.com')

    expect(actual).toStrictEqual(expected)
  })

  test('404 URL returns null', async () => {
    const expected = null
    const actual: OpenGraph | null = await parse('http://localhost/404')

    expect(actual).toStrictEqual(expected)
  })

  test.todo('case not UTF-8 (avoid garbled text)')
})
