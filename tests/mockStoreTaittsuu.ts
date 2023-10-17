import { type Store } from '~/models/frontend/Store'
import type { PreferenceTaittsuu } from '~/models/PreferenceTaittsuu'

export const createStoreTaittsuu = (): Store<PreferenceTaittsuu> => {
  return {
    data: {
      service: 'Taittsuu',
      enabled: true,
      paused: false,
    },
    set: async (key: string, value: string | number | boolean) => {
      // noop
    },
  }
}
