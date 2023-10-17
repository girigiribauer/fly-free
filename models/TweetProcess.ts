import { StorageIdentifier } from '~/definitions'
import type { PostStatusProcess } from '~/models/PostStatus'

export type TweetProcess = {
  process: PostStatusProcess
}

export const saveTweetProcess = async (tweet: TweetProcess): Promise<void> => {
  const { process } = tweet
  const key = `${StorageIdentifier}_tweeting`
  await chrome.storage.local.set({ [key]: process })

  return
}

export const loadTweetProcess = async (): Promise<TweetProcess | null> => {
  const key = `${StorageIdentifier}_tweeting`
  const rawObject = await chrome.storage.local.get([key])

  if (!rawObject) return null
  if (!(key in rawObject)) return null
  if (!rawObject[key]) return null
  if (Object.keys(rawObject[key]).length === 0) return null

  const process = rawObject[key] as PostStatusProcess

  await chrome.storage.local.set({ [key]: null })

  return { process }
}
