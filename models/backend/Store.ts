import type { Preference } from '~/models/Preference'
import { loadPreference } from '~/models/Preference'
import type { ServiceName } from '~/models/ServiceName'

export interface Store {
  data: Preference
}

export const createStore = async (service: ServiceName): Promise<Store> => {
  const data = await loadPreference(service)

  return Promise.resolve({
    data,
  })
}
