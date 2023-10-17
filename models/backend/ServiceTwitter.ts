import type { Service } from '~/models/backend/Service'
import { getDataAsync } from '~/models/backend/Service'
import type { Store } from '~/models/backend/Store'
import type { Post } from '~/models/Post'
import type { PreferenceTwitter } from '~/models/PreferenceTwitter'

const service = 'Twitter'

export const createTwitter = (store: Store): Service => ({
  service,
  store,
  post: post.bind(this, store),
  getDataAsync: getDataAsync.bind(this, store),
})

const post = async (
  store: Store,
  post: Post,
  preference: PreferenceTwitter,
): Promise<string> => {
  // noop
  return 'https://twitter.com'
}
