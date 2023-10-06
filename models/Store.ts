import { useEffect, useState } from 'react'

import { StorageIdentifier } from '~/definitions'
import type { PostStatusProcess } from '~/models/PostStatus'
import type { ServiceName } from '~/models/ServiceName'
import type { ServicePreference } from '~/models/ServicePreference'

export type Store = {
  data: ServicePreference | null
  set: (key: string, value: string | number | boolean) => Promise<void>
}

const load = async (
  service: ServiceName | 'tweet',
): Promise<ServicePreference> => {
  const key = `${StorageIdentifier}_${service}`
  const loaded = await chrome.storage.local.get([key])
  return loaded[key] as ServicePreference
}

const save = async (service, preference): Promise<void> => {
  const key = `${StorageIdentifier}_${service}`
  await chrome.storage.local.set({ [key]: preference })

  return
}

export const suspendTweeting = async (
  postStatus: PostStatusProcess,
): Promise<void> => {
  const key = `${StorageIdentifier}_tweeting`
  await chrome.storage.local.set({ [key]: postStatus })

  return
}

export const resumeTweeting = async (): Promise<PostStatusProcess | null> => {
  const key = `${StorageIdentifier}_tweeting`
  const rawObject = await chrome.storage.local.get([key])

  if (!rawObject) return null
  if (!(key in rawObject)) return null
  if (!rawObject[key]) return null
  if (Object.keys(rawObject[key]).length === 0) return null

  const postStatus = rawObject[key] as PostStatusProcess

  await chrome.storage.local.set({ [key]: null })

  return postStatus
}

export const createStore = (service: ServiceName): Store => {
  const [data, setData] = useState<ServicePreference | null>(null)

  const update = save.bind(this, service)

  useEffect(() => {
    if (!!data) return

    void (async () => {
      const newData = await load(service)
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

export const createStoreAsync = async (
  service: ServiceName,
): Promise<Store> => {
  const data = await load(service)
  return Promise.resolve({
    data,
    set: async (key: string, value: string | number | boolean) => {
      // something?
      console.warn('unimplemented')
    },
  })
}
