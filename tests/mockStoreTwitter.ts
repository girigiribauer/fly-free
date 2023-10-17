import { type Store } from '~/models/frontend/Store'
import type { PreferenceTwitter } from '~/models/PreferenceTwitter'

export const createStoreTwitter = (): Store<PreferenceTwitter> => {
  return {
    data: {
      service: 'Twitter',
      enabled: true,
      paused: false,
    },
    set: async (key: string, value: string | number | boolean) => {
      // noop
    },
  }
}
