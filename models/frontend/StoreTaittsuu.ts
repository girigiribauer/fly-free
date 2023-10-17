import { createStore, type Store } from '~/models/frontend/Store'
import {
  DefaultPreference,
  type PreferenceTaittsuu,
} from '~/models/PreferenceTaittsuu'

export const createStoreTaittsuu = (): Store<PreferenceTaittsuu> => {
  const { data, set } = createStore('Taittsuu')

  const initializedData = Object.assign({}, DefaultPreference, data)

  return {
    data: initializedData,
    set,
  }
}
