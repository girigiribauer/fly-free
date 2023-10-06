export type Draft = {
  text: string
  imageURLs: string[]
  linkcardURL: string | null
}

export const createDraft = (
  text: string,
  imageURLs: string[],
  domain: string,
): Draft => {
  const linkcardURL = pickupLinkcardURL(text, domain)

  return {
    text,
    imageURLs,
    linkcardURL,
  }
}

export const pickupLinkcardURL = (
  text: string,
  domain: string,
): string | null => {
  if (domain === '') return null
  const urlRe =
    /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi
  const links = [...text.matchAll(urlRe)]
  if (links.length === 0) {
    return null
  }

  const link = links.slice().reverse().at(0)[0]

  return link.includes(domain) ? link : null
}
