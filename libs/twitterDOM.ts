import {
  SelectorAttachments,
  SelectorDroppedImage,
  SelectorLinkcard,
  SelectorLinkcardDomain,
  SelectorTextarea,
} from '~/definitions'
import { createDraft } from '~/models/Draft'
import type { Draft } from '~/models/Draft'

export type DraftDOMs = {
  textarea: HTMLDivElement | undefined
  attachments: HTMLDivElement | undefined
  linkcard: HTMLDivElement | undefined
}

export const queryFromUnstableDOM = (): DraftDOMs => {
  const textarea = document.querySelector<HTMLDivElement>(SelectorTextarea)
  const attachments =
    document.querySelector<HTMLDivElement>(SelectorAttachments)
  const linkcard = document.querySelector<HTMLDivElement>(SelectorLinkcard)

  return {
    textarea,
    attachments,
    linkcard,
  }
}

export const captureDraft = (doms: DraftDOMs): Draft | null => {
  const { textarea, attachments, linkcard } = doms
  if (!textarea) {
    return null
  }

  const newText = [...textarea.querySelectorAll('[data-block="true"]')]
    .map((b) => b.textContent)
    .join('\n')
  const newImages = attachments
    ? Array.from(
        attachments.querySelectorAll(SelectorDroppedImage),
        (elem: HTMLImageElement) => elem.src,
      )
    : []

  let newDomain: string = ''
  if (linkcard) {
    const domainContainer = linkcard.querySelector(SelectorLinkcardDomain)
    if (!domainContainer) {
      console.warn('not found domainContainer')
    }

    newDomain = domainContainer.textContent
  }

  return createDraft(newText, newImages, newDomain)
}
