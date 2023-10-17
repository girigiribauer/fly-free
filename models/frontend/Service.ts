import type { Draft } from '~/models/Draft'
import type { Store } from '~/models/frontend/Store'
import type { Preference } from '~/models/Preference'
import type { ServiceName } from '~/models/ServiceName'
import type { ServiceStatus } from '~/models/ServiceStatus'

export interface Service {
  service: ServiceName
  store: Store<Preference>
  iconURL: string
  getStatus: (draft: Draft) => ServiceStatus
  switchPausing: (isPaused: boolean) => Promise<void>
}

export const switchPausing = async (
  store: Store<Preference>,
  isPaused: boolean,
) => {
  await store.set('paused', isPaused)
}
