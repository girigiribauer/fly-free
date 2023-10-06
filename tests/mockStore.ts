import { type Store } from '~/models/Store'
import type { ServiceName } from '~models/ServiceName'

export const createStore = (service: ServiceName): Store => {
  return {
    data: {
      service,
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
