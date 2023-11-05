import { useCallback, useEffect, useState } from 'react'

import {
  SelectorAttachments,
  SelectorCardDomain,
  SelectorCardWrapper,
  SelectorDroppedImage,
  SelectorTextarea,
} from '~/definitions'
import { createDraft } from '~/models/Draft'
import type { Draft } from '~/models/Draft'

let debounceTimer = null

const callbackDebounced = (
  callback: (
    mutationList: MutationRecord[],
    observer: MutationObserver,
  ) => void,
  mutationList: MutationRecord[],
  observer: MutationObserver,
) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    callback(mutationList, observer)
  }, 200)
}

export const useScanDraft = (
  container: HTMLElement | undefined,
  handleSubmit: () => void,
  log: (newLog: string) => void,
): Draft | null => {
  let textareaObserver: MutationObserver
  const [draft, setDraft] = useState<Draft | null>(null)

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
        log('submit by keyboard')
        event.preventDefault()
        event.stopPropagation()
        handleSubmit()
      }
      if (event.key === 'Escape') {
        log('cancel escape event')
        event.preventDefault()
        event.stopPropagation()
      }
    },
    [draft],
  )

  // TODO: beautify...
  const observeTwitterUI = useCallback(() => {
    log('call observeTwitterUI')
    let textarea: HTMLDivElement
    let attachments: HTMLDivElement
    let cardWrapper: HTMLDivElement

    textareaObserver = new MutationObserver(
      callbackDebounced.bind(undefined, () => {
        log(`textarea has ${!!document.querySelector(SelectorTextarea)}`)
        log(`attachments has ${!!document.querySelector(SelectorAttachments)}`)
        log(`cardWrapper has ${!!document.querySelector(SelectorCardWrapper)}`)

        if (!textarea) {
          log('not found textarea, and try to get textarea')
          textarea = document.querySelector(SelectorTextarea)
          if (textarea) {
            log('set keyboard event handler')
            textarea.onkeydown = handleKeyDown
          }
        }
        attachments = document.querySelector(SelectorAttachments)
        cardWrapper = document.querySelector(SelectorCardWrapper)

        if (!textarea) {
          log('not found textarea')
          return
        }

        log(`newText(textContent) is "${textarea.textContent}".`)
        log(`newText(innerText) is "${textarea.innerText}".`)
        const newText = textarea.textContent
        const newImages = attachments
          ? Array.from(
              attachments.querySelectorAll(SelectorDroppedImage),
              (elem: HTMLImageElement) => elem.src,
            )
          : []

        let newDomain: string = ''
        if (cardWrapper) {
          const domainContainer = cardWrapper.querySelector(SelectorCardDomain)
          if (!domainContainer) {
            log('not found domainContainer')
            console.warn('not found domainContainer')
          }

          const newDomainText = domainContainer.textContent
          log(`newDomainText is ${newDomainText}`)
          newDomain = newDomainText
        }

        const newDraft = createDraft(newText, newImages, newDomain)
        log(`newDraft is ${JSON.stringify(newDraft)}`)
        setDraft(newDraft)
      }),
    )
    textareaObserver.observe(container, {
      attributes: true,
      childList: true,
      subtree: true,
      characterData: true,
    })
  }, [])

  const unobserveTwitterUI = useCallback(() => {
    log('call unobserveTwitterUI')
    textareaObserver?.disconnect()
  }, [])

  if (!container) return null

  useEffect(() => {
    if (document.readyState === 'complete') {
      log('document.readyState === "complete" is truthy')
      observeTwitterUI()
      return unobserveTwitterUI
    } else {
      log('document.readyState === "complete" is falsy')
      window.addEventListener('load', observeTwitterUI)

      return () => {
        log('call useEffect cleanup')
        window.removeEventListener('load', observeTwitterUI)
        unobserveTwitterUI()
      }
    }
  }, [])

  return draft
}
