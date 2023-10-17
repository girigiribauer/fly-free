import iconTwitter from 'data-base64:~/assets/icon-twitter.svg'
import twitter from 'twitter-text'

import type { Draft } from '~/models/Draft'
import { switchPausing, type Service } from '~/models/frontend/Service'
import type { Store } from '~/models/frontend/Store'
import type { PreferenceTwitter } from '~/models/PreferenceTwitter'
import type { ServiceStatus } from '~/models/ServiceStatus'

const service = 'Twitter'

export const createTwitter = (store: Store<PreferenceTwitter>): Service => ({
  service,
  store,
  iconURL: iconTwitter,
  getStatus: getStatus.bind(this, store),
  switchPausing: switchPausing.bind(this, store),
})

const getStatus = (
  store: Store<PreferenceTwitter>,
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

  if (store.data.paused) {
    return {
      type: 'Paused',
      service,
    }
  }

  const { text, imageURLs } = draft

  if (!text || text.length === 0) {
    const hasNoImage = !imageURLs || imageURLs.length === 0
    return {
      type: hasNoImage ? 'Invalid' : 'Valid',
      service,
    }
  }

  const { valid } = twitter.parseTweet(text)
  if (!valid) {
    return {
      type: 'Invalid',
      service,
    }
  }

  return {
    type: 'Valid',
    service,
  }
}
