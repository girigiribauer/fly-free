import { createStore, type Store } from '~/models/frontend/Store'
import {
  DefaultPreference,
  type PreferenceBluesky,
} from '~/models/PreferenceBluesky'

export const createStoreBluesky = (): Store<PreferenceBluesky> => {
  const { data, set } = createStore('Bluesky')

  const initializedData = Object.assign({}, DefaultPreference, data)

  return {
    data: initializedData,
    set,
  }
}
