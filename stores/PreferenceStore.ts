import {
    backupDeliveryState,
    loadPreference,
    restoreDeliveryState,
    savePreference,
    setAdapter as setRepositoryAdapter,
} from '~/infrastructures/PreferenceRepository'
import type { DeliveryAgentStateOnDelivery } from '~/models/DeliveryAgentState'
import type { Preference } from '~/models/Preference'
import type { StorageAdapter } from '~/interfaces/StorageAdapter'

export const PreferenceDefaults: Preference = Object.freeze<Preference>({
    twitterPaused: false,
    blueskyPaused: false,
    blueskyUsername: '',
    blueskyPassword: '',
    globalAutoclosing: false,
    globalForceblank: false,

})

let pref: Preference = Object.assign({}, PreferenceDefaults)
let listeners = []

// Proxy for testing
export const setAdapter = (newAdapter: StorageAdapter) => {
    setRepositoryAdapter(newAdapter)
}

export const load = async (): Promise<Preference> => {
    const loadedPref = await loadPreference()
    pref = Object.assign({}, PreferenceDefaults, loadedPref)
    listen()

    return pref
}

export const save = async (newPref: Preference): Promise<void> => {
    await savePreference(newPref)
}

export const backupDelivery = async (
    delivery: DeliveryAgentStateOnDelivery,
): Promise<void> => {
    await backupDeliveryState(delivery)
}

export const restoreDelivery =
    async (): Promise<DeliveryAgentStateOnDelivery | null> => {
        return await restoreDeliveryState()
    }

const listen = () => {
    for (let listener of listeners) {
        listener()
    }
}

export const updateStore = async (diff: Partial<Preference>) => {
    pref = Object.assign({}, pref, diff)

    await save(pref)

    listen()
}

export const subscribe = (listener) => {
    listeners = [...listeners, listener]

    return () => {
        listeners = listeners.filter((l) => l !== listener)
    }
}

export const getSnapshot = () => {
    return pref
}
