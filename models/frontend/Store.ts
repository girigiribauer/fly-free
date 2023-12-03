import { useCallback, useEffect, useState } from 'react'

import type { Preference } from '~/models/Preference'
import { loadPreference, savePreference } from '~/models/Preference'
import type { ServiceName } from '~/models/ServiceName'

export interface Store<T extends Preference> {
  data: T | null
  set: (key: string, value: string | number | boolean) => Promise<void>
}

export const createStore = (service: ServiceName): Store<Preference> => {
  const [data, setData] = useState<Preference | null>(null)

  const update = useCallback(
    (newData) => savePreference(service, newData),
    [savePreference],
  )

  useEffect(() => {
    if (!!data) return

    void (async () => {
      const newData = await loadPreference(service)
      setData(() => newData)
    })()
  }, [])

  return {
    data,
    set: async (key: string, value: string | number | boolean) => {
      const newData = { ...data, [key]: value }
      await update(newData)
      setData(newData)
    },
  }
}
