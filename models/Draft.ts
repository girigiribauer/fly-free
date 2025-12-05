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

export const pickupLinkcardURL = (text: string): string | null => {
  const urlRe =
    /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi
  const links = [...text.matchAll(urlRe)]
  if (links.length === 0) {
    return null
  }

  const link = links.slice().reverse().at(0)[0]

  return link
}

export const cleanDraftText = (text: string): string => {
  const trimmed = text.trim()
  const lines = trimmed.split('\n')
  if (lines.length <= 1) return trimmed

  const lastLine = lines[lines.length - 1].trim()
  // Check if last line is a URL
  if (lastLine.startsWith('http://') || lastLine.startsWith('https://')) {
    const previousText = lines.slice(0, -1).join('\n')
    // If the URL exists in the previous text, remove the last line
    if (previousText.includes(lastLine)) {
      return previousText.trim()
    }
  }
  return trimmed
}
