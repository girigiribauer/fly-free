import { useEffect, useSyncExternalStore } from 'react'

import type { Preference } from '~/models/Preference'
import { getSnapshot, load, subscribe } from '~/models/Store'

export const useStore = () => {
  useEffect(() => {
    void (async () => {
      await load()
      getSnapshot()
    })()
  }, [])

  return useSyncExternalStore<Preference>(subscribe, getSnapshot)
}
