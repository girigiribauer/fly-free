import { pickupLinkcardURL } from '~/libs/DraftUtils'

export type Draft = {
  text: string
  imageURLs: string[]
  linkcardURL: string | null
}

export const createDraft = (text: string, imageURLs: string[]): Draft => {
  const linkcardURL = pickupLinkcardURL(text)

  return {
    text,
    imageURLs,
    linkcardURL,
  }
}
