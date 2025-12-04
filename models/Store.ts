import { StorageIdentifier } from '~/definitions'
import type { DeliveryAgentStateOnDelivery } from '~/models/DeliveryAgentState'
import type { Preference } from '~/models/Preference'

const storageKeyTwitter = `${StorageIdentifier}_Twitter`
const storageKeyBluesky = `${StorageIdentifier}_Bluesky`
const storageKeyGlobal = `${StorageIdentifier}_Global`
const storageKeyTemporary = `${StorageIdentifier}_Temporary`

export const PreferenceDefaults: Preference = Object.freeze<Preference>({
  twitterPaused: false,
  blueskyPaused: false,
  blueskyUsername: '',
  blueskyPassword: '',
  globalAutoclosing: false,
  globalForceblank: false,
  dryRun: false,
})

let pref: Preference = Object.assign({}, PreferenceDefaults)
let listeners = []

export const load = async (): Promise<Preference> => {
  const loaded = await chrome.storage.local.get([
    storageKeyTwitter,
    storageKeyBluesky,
    storageKeyGlobal,
  ])

  const loadedPref: Partial<Preference> = {
    ...loaded[storageKeyTwitter],
    ...loaded[storageKeyBluesky],
    ...loaded[storageKeyGlobal],
  }

  pref = Object.assign({}, PreferenceDefaults, loadedPref)
  listen()

  return pref
}

export const save = async (pref: Preference): Promise<void> => {
  const saveObject = {
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

  await chrome.storage.local.set(saveObject)
}

export const backupDelivery = async (
  delivery: DeliveryAgentStateOnDelivery,
): Promise<void> => {
  await chrome.storage.local.set({ [storageKeyTemporary]: delivery })

  return
}

export const restoreDelivery =
  async (): Promise<DeliveryAgentStateOnDelivery | null> => {
    const rawObject = await chrome.storage.local.get([storageKeyTemporary])

    // TODO: improvement
    if (!rawObject) return null
    if (!(storageKeyTemporary in rawObject)) return null
    if (!rawObject[storageKeyTemporary]) return null
    if (Object.keys(rawObject[storageKeyTemporary]).length === 0) return null

    const delivery = rawObject[
      storageKeyTemporary
    ] as DeliveryAgentStateOnDelivery

    await chrome.storage.local.set({ [storageKeyTemporary]: null })

    return delivery
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
