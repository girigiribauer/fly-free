import { afterEach, describe, expect, test } from 'vitest'

import type { Preference } from '~/models/Preference'
import { load, PreferenceDefaults, save, setAdapter } from '~/stores/PreferenceStore'
import type { StorageAdapter } from '~/interfaces/StorageAdapter'

class InMemoryStorageAdapter implements StorageAdapter {
    private storage: Record<string, any> = {}

    async get(keys: string[]): Promise<Record<string, any>> {
        const result = {}
        for (const key of keys) {
            if (key in this.storage) {
                result[key] = this.storage[key]
            }
        }
        return result
    }

    async set(items: Record<string, any>): Promise<void> {
        for (const key in items) {
            this.storage[key] = items[key]
        }
    }

    // Helper for testing
    clear() {
        this.storage = {}
    }
}

describe('load', () => {
    const mockAdapter = new InMemoryStorageAdapter()
    setAdapter(mockAdapter)

    afterEach(async () => {
        mockAdapter.clear()
    })

    test('saving values are same to loading values', async () => {
        const expected = {
            test123: {
                string: 'foobar',
                array: [0, 1, 2],
                object: { foo: 'bar' },
            },
        }
        // Manipulate mock directly
        await mockAdapter.set(expected)

        // Test get via adapter
        const actual = await mockAdapter.get(['test123'])

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
