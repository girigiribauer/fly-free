import type { Store } from '~/models/backend/Store'
import type { Post } from '~/models/Post'
import type { Preference } from '~/models/Preference'
import type { ServiceName } from '~/models/ServiceName'

export interface Service {
  service: ServiceName
  store: Store
  post: (post: Post, preference: Preference) => Promise<string>
  getDataAsync: () => Promise<Preference>
}

export const getDataAsync = (store: Store) => {
  // TODO: timeout
  return new Promise((resolve) => {
    const timer = setInterval(() => {
      if (store.data !== null) {
        clearTimeout(timer)
        resolve(store.data)
      }
    }, 1000)
    store.data
  })
}
