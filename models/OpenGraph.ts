import { Parser, type DefaultTreeAdapterMap } from 'parse5'
import type { TextNode } from 'parse5/dist/tree-adapters/default'

export type OpenGraph = {
  title: string
  description: string
  ogImage: string
  url: string
}

export const parse = async (linkcardURL: string): Promise<OpenGraph | null> => {
  let title: string | null = null
  let description: string | null = null
  let ogImage: string | null = null
  let url: string | null = null

  let res: Response
  try {
    res = await fetch(linkcardURL)
  } catch (_) {
    return null
  }
  const html = await res.text()

  // TODO: when not UTF-8
  // here!

  const document = Parser.parse<DefaultTreeAdapterMap>(html)

  const htmlElement = document.childNodes.find((a) => a.nodeName === 'html')
  if (!htmlElement || htmlElement.nodeName !== 'html') return null

  htmlElement.childNodes.forEach((a) => {
    if (a.nodeName === 'head') {
      a.childNodes.forEach((b) => {
        if (
          b.nodeName === 'title' &&
          b.childNodes.some((c) => c.nodeName === '#text')
        ) {
          const titleElement = b.childNodes.find((c) => c.nodeName === '#text')
          if (titleElement && titleElement.nodeName === '#text') {
            title = (titleElement as TextNode).value
          }
        }

        if (
          b.nodeName === 'meta' &&
          b.attrs.some((c) => c.name === 'name' && c.value === 'description')
        ) {
          description = b.attrs.find((c) => c.name === 'content').value ?? null
        }

        if (
          b.nodeName === 'meta' &&
          b.attrs.some((c) => c.name === 'property' && c.value === 'og:image')
        ) {
          ogImage = b.attrs.find((c) => c.name === 'content').value ?? null
        }

        if (
          b.nodeName === 'meta' &&
          b.attrs.some((c) => c.name === 'property' && c.value === 'og:url')
        ) {
          url = b.attrs.find((c) => c.name === 'content').value ?? null
        }
      })
    }
  })

  if (!title || !description || !ogImage || !url) {
    return null
  }

  return {
    title,
    description,
    ogImage,
    url,
  }
}
