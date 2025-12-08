import { describe, expect, test } from 'vitest'
import { getTwitterIntentURL, TwitterTweetURL } from '~/libs/TwitterURLBuilder'

describe('getTwitterIntentURL', () => {
    test('Should return base URL with ff=1 when forced blank', () => {
        const result = getTwitterIntentURL('hello', 'https://example.com', true)
        expect(result).toBe(`${TwitterTweetURL}?ff=1`)
    })

    test('Should include text and url params', () => {
        const text = 'Hello World'
        const url = 'https://example.com'
        const result = getTwitterIntentURL(text, url, false)

        const expectedParams = new URLSearchParams({
            ff: '1',
            text: text,
            url: url
        })
        expect(result).toBe(`${TwitterTweetURL}?${expectedParams.toString()}`)
    })

    test('Should handle empty text', () => {
        const url = 'https://example.com'
        const result = getTwitterIntentURL(undefined, url, false)

        const expectedParams = new URLSearchParams({
            ff: '1',
            url: url
        })
        expect(result).toBe(`${TwitterTweetURL}?${expectedParams.toString()}`)
    })

    test('Should handle empty url', () => {
        const text = 'Hello'
        const result = getTwitterIntentURL(text, undefined, false)

        const expectedParams = new URLSearchParams({
            ff: '1',
            text: text
        })
        expect(result).toBe(`${TwitterTweetURL}?${expectedParams.toString()}`)
    })

    test('Should encode special characters correctly', () => {
        const text = 'Hello & World ?'
        const result = getTwitterIntentURL(text, undefined, false)

        // URLSearchParams handles encoding automatically
        expect(result).toContain('Hello+%26+World+%3F')
        // Or strictly:
        const expectedParams = new URLSearchParams({
            ff: '1',
            text: text
        })
        expect(result).toBe(`${TwitterTweetURL}?${expectedParams.toString()}`)
    })
})
