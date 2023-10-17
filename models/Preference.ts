import { StorageIdentifier } from '~/definitions'
import type { ServiceName } from '~/models/ServiceName'

export type Preference = {
  service: ServiceName
  enabled: boolean
  paused: boolean
}

export const loadPreference = async (
  service: ServiceName,
): Promise<Preference> => {
  const key = `${StorageIdentifier}_${service}`
  const loaded = await chrome.storage.local.get([key])

  // TODO: check type
  return loaded[key] as Preference
}

export const savePreference = async (
  service: ServiceName,
  preference: Preference,
): Promise<void> => {
  // TODO: validation
  const key = `${StorageIdentifier}_${service}`
  await chrome.storage.local.set({ [key]: preference })

  return
}
