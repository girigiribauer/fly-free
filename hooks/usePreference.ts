import { useEffect, useSyncExternalStore } from 'react'

import type { Preference } from '~/models/Preference'
import { getSnapshot, load, subscribe } from '~/stores/PreferenceStore'

export const usePreference = () => {
  useEffect(() => {
    void (async () => {
      await load()
      getSnapshot()
    })()
  }, [])

  return useSyncExternalStore<Preference>(subscribe, getSnapshot)
}
