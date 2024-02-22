import { DOMParser } from '@xmldom/xmldom'
import { Parser } from 'parse5'
import type { DefaultTreeAdapterMap } from 'parse5'
import { serializeToString } from 'xmlserializer'
import { isAttribute, isTextNode, useNamespaces } from 'xpath'
import type { SelectSingleReturnType } from 'xpath'

export type OpenGraph = {
  title: string
  description: string
  ogImage: string
  url: string
}

export const parse = async (linkcardURL: string): Promise<OpenGraph | null> => {
  let res: Response
  try {
    res = await fetch(linkcardURL)
  } catch (_) {
    return null
  }
  const html = await res.text()
  const ast = Parser.parse<DefaultTreeAdapterMap>(html)
  const xhtml = serializeToString(ast)
  const document = new DOMParser().parseFromString(xhtml)

  // TODO: when not UTF-8
  // here!

  const title = parseTitle(document)
  const description = parseDescription(document)
  const ogImage = parseOgImage(document)
  const url = parseURL(document, linkcardURL)

  if (!ogImage) {
    return null
  }

  return {
    title,
    description,
    ogImage,
    url,
  }
}

const parseTitle = (doc: Document): string => {
  const select = useNamespaces({ x: 'http://www.w3.org/1999/xhtml' })
  let title: string = ''

  const regularTitleContent: SelectSingleReturnType = select(
    'string(//x:title)',
    doc,
    true,
  )
  if (isTextNode(regularTitleContent)) {
    title = regularTitleContent.nodeValue
  }

  const ogTitleAttribute: SelectSingleReturnType = select(
    '//x:meta[@property="og:title"]/@content',
    doc,
    true,
  )
  if (isAttribute(ogTitleAttribute)) {
    title = ogTitleAttribute.nodeValue
  }

  return title
}

const parseDescription = (doc: Document): string => {
  const select = useNamespaces({ x: 'http://www.w3.org/1999/xhtml' })
  let description: string = ''

  const regularDescriptionAttribute: SelectSingleReturnType = select(
    '//x:meta[@name="description"]/@content',
    doc,
    true,
  )
  if (isAttribute(regularDescriptionAttribute)) {
    description = regularDescriptionAttribute.nodeValue
  }

  const ogDescriptionAttribute: SelectSingleReturnType = select(
    '//x:meta[@property="og:description"]/@content',
    doc,
    true,
  )
  if (isAttribute(ogDescriptionAttribute)) {
    description = ogDescriptionAttribute.nodeValue
  }

  return description
}

const parseOgImage = (doc: Document): string | null => {
  const select = useNamespaces({ x: 'http://www.w3.org/1999/xhtml' })
  let ogImage: string | null = null

  const ogImageAttribute: SelectSingleReturnType = select(
    '//x:meta[@property="og:image"]/@content',
    doc,
    true,
  )
  if (isAttribute(ogImageAttribute)) {
    ogImage = ogImageAttribute.nodeValue
  }

  return ogImage
}

const parseURL = (doc: Document, originURL: string): string => {
  const select = useNamespaces({ x: 'http://www.w3.org/1999/xhtml' })
  let url: string = originURL

  const ogURLAttribute: SelectSingleReturnType = select(
    '//x:meta[@property="og:url"]/@content',
    doc,
    true,
  )
  if (isAttribute(ogURLAttribute)) {
    url = ogURLAttribute.nodeValue
  }

  return url
}
