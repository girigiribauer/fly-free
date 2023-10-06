import iconTaittsuu from 'data-base64:~/assets/icon-taittsuu.svg'

import type { Draft } from '~/models/Draft'
import type { Post } from '~/models/Post'
import type { ServiceBackend, ServiceFrontend } from '~/models/Service'
import { getDataAsync, switchPausing } from '~/models/Service'
import type { ServicePreference } from '~/models/ServicePreference'
import type { ServiceStatus } from '~/models/ServiceStatus'
import type { Store } from '~/models/Store'

const service = 'Taittsuu'

export const createTaittsuuFrontend = (store: Store): ServiceFrontend => ({
  service,
  store,
  iconURL: iconTaittsuu,
  getStatus: getStatus.bind(this, store),
  switchPausing: switchPausing.bind(this, store),
})

export const createTaittsuuBackend = (store: Store): ServiceBackend => ({
  service,
  store,
  post: post.bind(this, store),
  getDataAsync: getDataAsync.bind(this, store),
})

const getStatus = (store: Store, _: Draft): ServiceStatus => {
  return {
    type: 'Paused',
    service: 'Taittsuu',
  }
}

const post = async (
  store: Store,
  post: Post,
  preference: ServicePreference,
): Promise<string> => {
  throw new Error('unimplemented')
}
