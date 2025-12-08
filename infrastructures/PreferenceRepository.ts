import { StorageIdentifier } from '~/definitions'
import { ChromeStorageAdapter } from '~/infrastructures/ChromeStorageAdapter'
import type { DeliveryAgentStateOnDelivery } from '~/models/DeliveryAgentState'
import type { Preference } from '~/models/Preference'
import type { StorageAdapter } from '~/interfaces/StorageAdapter'

const storageKeyTwitter = `${StorageIdentifier}_Twitter`
const storageKeyBluesky = `${StorageIdentifier}_Bluesky`
const storageKeyGlobal = `${StorageIdentifier}_Global`
const storageKeyTemporary = `${StorageIdentifier}_Temporary`

let adapter: StorageAdapter | null = null

const getAdapter = (): StorageAdapter => {
    if (!adapter) {
        adapter = new ChromeStorageAdapter()
    }
    return adapter
}

export const setAdapter = (newAdapter: StorageAdapter) => {
    adapter = newAdapter
}

export const loadPreference = async (): Promise<Partial<Preference>> => {
    const loaded = await getAdapter().get([
        storageKeyTwitter,
        storageKeyBluesky,
        storageKeyGlobal,
    ])

    return {
        ...loaded[storageKeyTwitter],
        ...loaded[storageKeyBluesky],
        ...loaded[storageKeyGlobal],
    }
}

export const savePreference = async (pref: Preference): Promise<void> => {
    const flatSaveObject = {
        [storageKeyTwitter]: {
            twitterPaused: pref.twitterPaused,
        },
        [storageKeyBluesky]: {
            blueskyPaused: pref.blueskyPaused,
            blueskyUsername: pref.blueskyUsername,
            blueskyPassword: pref.blueskyPassword,
        },
        [storageKeyGlobal]: {
            globalAutoclosing: pref.globalAutoclosing,
            globalForceblank: pref.globalForceblank,
            dryRun: pref.dryRun,
        },
    }

    await getAdapter().set(flatSaveObject)
}

export const backupDeliveryState = async (
    delivery: DeliveryAgentStateOnDelivery,
): Promise<void> => {
    await getAdapter().set({ [storageKeyTemporary]: delivery })
}

export const restoreDeliveryState =
    async (): Promise<DeliveryAgentStateOnDelivery | null> => {
        const rawObject = await getAdapter().get([storageKeyTemporary])

        if (!rawObject) return null
        if (!(storageKeyTemporary in rawObject)) return null
        if (!rawObject[storageKeyTemporary]) return null
        if (Object.keys(rawObject[storageKeyTemporary]).length === 0) return null

        const delivery = rawObject[
            storageKeyTemporary
        ] as DeliveryAgentStateOnDelivery

        await getAdapter().set({ [storageKeyTemporary]: null })

        return delivery
    }
