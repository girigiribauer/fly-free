import type { Service } from '~/models/backend/Service'
import { getDataAsync } from '~/models/backend/Service'
import type { Store } from '~/models/backend/Store'
import type { Post } from '~/models/Post'
import type { PreferenceTaittsuu } from '~/models/PreferenceTaittsuu'

const service = 'Taittsuu'

export const createTaittsuu = (store: Store): Service => ({
  service,
  store,
  post: post.bind(this, store),
  getDataAsync: getDataAsync.bind(this, store),
})

const post = async (
  store: Store,
  post: Post,
  preference: PreferenceTaittsuu,
): Promise<string> => {
  throw new Error('unimplemented')
}
