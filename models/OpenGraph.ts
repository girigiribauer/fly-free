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
    res = await fetch(linkcardURL, {
      redirect: 'follow',
    })
  } catch (_) {
    return null
  }
  const arrayBuffer = await res.arrayBuffer()
  const html = new TextDecoder('utf-8').decode(arrayBuffer)

  const ast = Parser.parse<DefaultTreeAdapterMap>(html)
  const xhtml = serializeToString(ast)
  let document = new DOMParser().parseFromString(xhtml)

  const charset = parseCharset(document)

  if (charset !== 'utf-8') {
    const decodedHTML = new TextDecoder(charset).decode(arrayBuffer)
    const decodedAST = Parser.parse<DefaultTreeAdapterMap>(decodedHTML)
    const decodedXHTML = serializeToString(decodedAST)

    document = new DOMParser().parseFromString(decodedXHTML)
  }

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

const parseCharset = (doc: Document): string => {
  const select = useNamespaces({ x: 'http://www.w3.org/1999/xhtml' })
  let charset = 'utf-8'

  const oldCharsetElement: SelectSingleReturnType = select(
    '//x:meta[@http-equiv="content-type"]/@content',
    doc,
    true,
  )
  if (isAttribute(oldCharsetElement)) {
    const found = oldCharsetElement.nodeValue.match(
      /text\/html;\s*charset=([A-Za-z0-9!#\$%&'\+\-\^_`\{\}~]+)/,
    )
    if (found?.length >= 1) {
      charset = found[1].toLowerCase()
    }
  }

  const charsetAttribute: SelectSingleReturnType = select(
    '//x:meta[@charset]/@charset',
    doc,
    true,
  )
  if (isAttribute(charsetAttribute)) {
    charset = charsetAttribute.nodeValue.trim().toLowerCase()
  }

  return charset
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
