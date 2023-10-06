import iconTwitter from 'data-base64:~/assets/icon-twitter.svg'
import twitter from 'twitter-text'

import type { Draft } from '~/models/Draft'
import type { Post } from '~/models/Post'
import type { ServiceBackend, ServiceFrontend } from '~/models/Service'
import { getDataAsync, switchPausing } from '~/models/Service'
import type { ServicePreference } from '~/models/ServicePreference'
import type { ServiceStatus } from '~/models/ServiceStatus'
import type { Store } from '~/models/Store'

const service = 'Twitter'

export const createTwitterFrontend = (store: Store): ServiceFrontend => ({
  service,
  store,
  iconURL: iconTwitter,
  getStatus: getStatus.bind(this, store),
  switchPausing: switchPausing.bind(this, store),
})

export const createTwitterBackend = (store: Store): ServiceBackend => ({
  service,
  store,
  post: post.bind(this, store),
  getDataAsync: getDataAsync.bind(this, store),
})

const getStatus = (store: Store, draft: Draft): ServiceStatus => {
  if (!draft) {
    return {
      type: 'Invalid',
      service,
    }
  }
  if (store.data && store.data.paused) {
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

const post = async (
  store: Store,
  post: Post,
  preference: ServicePreference,
): Promise<string> => {
  // noop
  return 'https://twitter.com'
}
