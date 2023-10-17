import { createStore, type Store } from '~/models/frontend/Store'
import {
  DefaultPreference,
  type PreferenceTwitter,
} from '~/models/PreferenceTwitter'

export const createStoreTwitter = (): Store<PreferenceTwitter> => {
  const { data, set } = createStore('Twitter')

  const initializedData = Object.assign({}, DefaultPreference, data)

  return {
    data: initializedData,
    set,
  }
}
