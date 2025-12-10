import { describe, expect, test, beforeEach } from 'vitest'
import {
    loadPreference,
    savePreference,
    backupDeliveryState,
    restoreDeliveryState,
    setAdapter
} from '~/infrastructures/PreferenceRepository'
import { StorageIdentifier } from '~/definitions'
import type { StorageAdapter } from '~/interfaces/StorageAdapter'
import type { Preference } from '~/models/Preference'
import type { DeliveryAgentStateOnDelivery } from '~/models/DeliveryAgentState'

const KeyTwitter = `${StorageIdentifier}_Twitter`
const KeyBluesky = `${StorageIdentifier}_Bluesky`
const KeyGlobal = `${StorageIdentifier}_Global`
const KeyTemporary = `${StorageIdentifier}_Temporary`

class MockStorageAdapter implements StorageAdapter {
    private store: Record<string, any> = {}

    async get(keys: string[]): Promise<Record<string, any>> {
        const result: Record<string, any> = {}
        keys.forEach(key => {
            if (this.store[key]) {
                result[key] = this.store[key]
            }
        })
        return result
    }

    async set(items: Record<string, any>): Promise<void> {
        Object.assign(this.store, items)
    }

    // Test helper
    _getStore() { return this.store }
    _clear() { this.store = {} }
}

describe('PreferenceRepository', () => {
    let mockAdapter: MockStorageAdapter

    beforeEach(() => {
        mockAdapter = new MockStorageAdapter()
        setAdapter(mockAdapter)
    })

    test('savePreference should map flat preference to storage keys', async () => {
        const pref: Preference = {
            twitterPaused: true,
            blueskyPaused: true,
            blueskyUsername: 'user',
            blueskyPassword: 'pass',
            globalAutoclosing: true,
            globalForceblank: true,
            dryRun: true
        }

        await savePreference(pref)

        const store = mockAdapter._getStore()
        expect(store[KeyTwitter]).toEqual({ twitterPaused: true })
        expect(store[KeyBluesky]).toEqual({
            blueskyPaused: true,
            blueskyUsername: 'user',
            blueskyPassword: 'pass'
        })
        expect(store[KeyGlobal]).toEqual({
            globalAutoclosing: true,
            globalForceblank: true,
            dryRun: true
        })
    })

    test('loadPreference should combine storage keys into flat preference', async () => {
        // Setup initial state
        await mockAdapter.set({
            [KeyTwitter]: { twitterPaused: true },
            [KeyBluesky]: { blueskyPaused: true },
            [KeyGlobal]: { dryRun: true }
        })

        const pref = await loadPreference()

        expect(pref.twitterPaused).toBe(true)
        expect(pref.blueskyPaused).toBe(true)
        expect(pref.dryRun).toBe(true)
    })

    test('backupDeliveryState and restoreDeliveryState should persist and clear', async () => {
        const deliveryState: DeliveryAgentStateOnDelivery = {
            type: 'Posting', // Using a valid type string from DeliveryAgentStateOnDelivery
            recipients: [],
            // @ts-ignore - Partial mock is enough for testing storage
            draft: {}
        } as any

        await backupDeliveryState(deliveryState)

        const store = mockAdapter._getStore()
        expect(store[KeyTemporary]).toEqual(deliveryState)

        const restored = await restoreDeliveryState()
        expect(restored).toEqual(deliveryState)

        // Should be cleared after restore
        const storeAfter = mockAdapter._getStore()
        expect(storeAfter[KeyTemporary]).toBeNull()
    })
})
