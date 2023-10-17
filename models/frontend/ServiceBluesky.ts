import iconBluesky from 'data-base64:~/assets/icon-bluesky.svg'

import type { Draft } from '~/models/Draft'
import type { Service } from '~/models/frontend/Service'
import { switchPausing } from '~/models/frontend/Service'
import type { Store } from '~/models/frontend/Store'
import type { PreferenceBluesky } from '~/models/PreferenceBluesky'
import type { ServiceStatus } from '~/models/ServiceStatus'

const service = 'Bluesky'

export const createBluesky = (store: Store<PreferenceBluesky>): Service => ({
  getStatus: getStatus.bind(this, store),
  switchPausing: switchPausing.bind(this, store),
  iconURL: iconBluesky,
  service,
  store,
})

const getStatus = (
  store: Store<PreferenceBluesky>,
  draft: Draft,
): ServiceStatus => {
  if (!store || !store.data) {
    throw new Error('Store is nothing')
  }

  if (!store.data.enabled) {
    return {
      type: 'Off',
      service,
    }
  }

  if (!draft) {
    return {
      type: 'Invalid',
      service,
    }
  }
  if (store.data.username === '' || store.data.password === '') {
    return {
      type: 'Invalid',
      service,
    }
  }

  if (store.data.paused) {
    return {
      type: 'Paused',
      service,
    }
  }

  const { text, imageURLs } = draft
  if ((!text || text.length === 0) && (!imageURLs || imageURLs.length === 0)) {
    return {
      type: 'Invalid',
      service,
    }
  }
  if (text.length > 300) {
    return { type: 'Invalid', service: 'Bluesky' }
  }
  // TODO: case embedded video

  return {
    type: 'Valid',
    service,
  }
}
