import { readFile } from 'fs/promises'
import path from 'path'
import { describe, expect, test } from 'vitest'

import { parseHTML, type OpenGraph } from '~/libs/OpenGraphParser'

const resources = [
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
]

describe('parseHTML', () => {
    test('https://ogp.me/ returns https://ogp.me/logo.png', async () => {
        const { url, file } = resources[0]
        const buffer = await readFile(path.join(__dirname, file), { encoding: null })
        const html = new TextDecoder('utf-8').decode(buffer)

        const expected = {
            title: 'Open Graph protocol',
            description:
                'The Open Graph protocol enables any web page to become a rich object in a social graph.',
            ogImage: 'https://ogp.me/logo.png',
            url: 'https://ogp.me/',
        }
        const actual = parseHTML(html, buffer.buffer as ArrayBuffer, url)

        expect(actual).toStrictEqual(expected)
    })

    test('http://example.com/ (no og:image) returns null', async () => {
        const { url, file } = resources[1]
        const buffer = await readFile(path.join(__dirname, file), { encoding: null })
        const html = new TextDecoder('utf-8').decode(buffer)

        const expected = null
        const actual = parseHTML(html, buffer.buffer as ArrayBuffer, url)

        expect(actual).toStrictEqual(expected)
    })

    test('https://automaton-media.com (2 og:image) returns one og:image object', async () => {
        const { url, file } = resources[2]
        const buffer = await readFile(path.join(__dirname, file), { encoding: null })
        const html = new TextDecoder('utf-8').decode(buffer)

        const expected = {
            title:
                '『デス・ストランディング2 ON THE BEACH』正式発表、2025年発売へ。“月”や復活したヒッグス、ルーを巡る謎深まる新映像公開 - AUTOMATON',
            description:
                'KOJIMA PRODUCTIONSは2月1日、『DEATH STRANDING 2 ON THE BEACH』を正式発表した。PS5向けに2025年発売予定。',
            ogImage:
                'https://automaton-media.com/wp-content/uploads/2024/02/20240201-280875-header.jpg',
            url: 'https://automaton-media.com/articles/newsjp/20240201-280875/',
        }
        const actual = parseHTML(html, buffer.buffer as ArrayBuffer, url)

        expect(actual).toStrictEqual(expected)
    })

    test('https://openai.com/sora returns specific image', async () => {
        const { url, file } = resources[3]
        const buffer = await readFile(path.join(__dirname, file), { encoding: null })
        const html = new TextDecoder('utf-8').decode(buffer)

        const expected = {
            title: 'Sora: Creating video from text',
            description: '',
            ogImage:
                'https://images.openai.com/blob/8264d3d7-922c-4343-b43d-6665e44bcb91/paper-airplanes.jpg?trim=0%2C0%2C0%2C0&width=1000&quality=80',
            url: 'https://openai.com/sora',
        }
        const actual = parseHTML(html, buffer.buffer as ArrayBuffer, url)

        expect(actual).toStrictEqual(expected)
    })

    test('https://www.joshwcomeau.com/ ... returns specific image', async () => {
        const { url, file } = resources[4]
        const buffer = await readFile(path.join(__dirname, file), { encoding: null })
        const html = new TextDecoder('utf-8').decode(buffer)

        const expected = {
            title: 'A Friendly Introduction to Spring Physics',
            description:
                "Of all the little tips and techniques I've picked up over the years about animation, spring physics remains one of the most powerful and flexible. In this tutorial, we'll learn how to harness their power to build fluid, organic transitions.",
            ogImage:
                'https://www.joshwcomeau.com/images/og-a-friendly-introduction-to-spring-physics.png',
            url: 'https://www.joshwcomeau.com/animation/a-friendly-introduction-to-spring-physics/',
        }
        const actual = parseHTML(html, buffer.buffer as ArrayBuffer, url)

        expect(actual).toStrictEqual(expected)
    })
    test('resolves relative URLs for og:url and og:image', () => {
        const html = `
            <html>
                <head>
                    <meta property="og:url" content="/relative/path" />
                    <meta property="og:image" content="../image.png" />
                </head>
            </html>
        `
        const buffer = new TextEncoder().encode(html)
        const result = parseHTML(html, buffer.buffer as ArrayBuffer, 'https://example.com/base/')

        expect(result).not.toBeNull()
        expect(result?.url).toBe('https://example.com/relative/path')
        expect(result?.ogImage).toBe('https://example.com/image.png')
    })
})
