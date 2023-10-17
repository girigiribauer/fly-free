import iconTaittsuu from 'data-base64:~/assets/icon-taittsuu.svg'

import type { Draft } from '~/models/Draft'
import type { Service } from '~/models/frontend/Service'
import { switchPausing } from '~/models/frontend/Service'
import type { Store } from '~/models/frontend/Store'
import type { PreferenceTaittsuu } from '~/models/PreferenceTaittsuu'
import type { ServiceStatus } from '~/models/ServiceStatus'

const service = 'Taittsuu'

export const createTaittsuu = (store: Store<PreferenceTaittsuu>): Service => ({
  service,
  store,
  iconURL: iconTaittsuu,
  getStatus: getStatus.bind(this, store),
  switchPausing: switchPausing.bind(this, store),
})

const getStatus = (
  store: Store<PreferenceTaittsuu>,
  _: Draft,
): ServiceStatus => {
  if (!store || !store.data) {
    throw new Error('Store is nothing')
  }

  return {
    type: 'Paused',
    service: 'Taittsuu',
  }
}
