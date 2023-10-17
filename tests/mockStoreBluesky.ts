import { type Store } from '~/models/frontend/Store'
import type { PreferenceBluesky } from '~/models/PreferenceBluesky'

export const createStoreBluesky = (): Store<PreferenceBluesky> => {
  return {
    data: {
      service: 'Bluesky',
      enabled: true,
      paused: false,
      username: 'username',
      password: 'password',
    },
    set: async (key: string, value: string | number | boolean) => {
      // noop
    },
  }
}
