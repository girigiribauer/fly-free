import type { Draft } from '~/models/Draft'
import type { Post } from '~/models/Post'
import type { ServiceName } from '~/models/ServiceName'
import type { ServicePreference } from '~/models/ServicePreference'
import type { ServiceStatus } from '~/models/ServiceStatus'
import type { Store } from '~/models/Store'

export interface ServiceFrontend {
  service: ServiceName
  store: Store
  iconURL: string
  getStatus: (draft: Draft) => ServiceStatus
  switchPausing: (isPaused: boolean) => Promise<void>
}

export interface ServiceBackend {
  service: ServiceName
  store: Store
  post: (post: Post, preference: ServicePreference) => Promise<string>
  getDataAsync: () => Promise<ServicePreference>
}

export type Service = ServiceFrontend & ServiceBackend

export const switchPausing = async (store: Store, isPaused: boolean) => {
  await store.set('paused', isPaused)
}

export const getDataAsync = (store: Store) => {
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
