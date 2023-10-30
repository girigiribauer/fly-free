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
  handleSubmit: () => void,
  log: (newLog: string) => void,
): Draft | null => {
  let textareaObserver: MutationObserver
  const [draft, setDraft] = useState<Draft | null>(null)

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault()
        event.stopPropagation()
        handleSubmit()
      }
      if (event.key === 'Escape') {
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
        if (!textarea) {
          textarea = document.querySelector(SelectorTextarea)
          if (textarea) {
            textarea.onkeydown = handleKeyDown
          }
        }
        attachments = document.querySelector(SelectorAttachments)
        cardWrapper = document.querySelector(SelectorCardWrapper)

        if (!textarea) return

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
            console.warn('not found domainContainer')
          }

          newDomain = domainContainer.textContent
        }

        setDraft(createDraft(newText, newImages, newDomain))
      }),
    )
    textareaObserver.observe(document.body, {
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

  useEffect(() => {
    if (document.readyState === 'complete') {
      log('document.readyState === "complete" is truthy')
      observeTwitterUI()
      return unobserveTwitterUI
    } else {
      log('document.readyState === "complete" is falsy')
      window.addEventListener('load', observeTwitterUI)
      window.addEventListener('unload', unobserveTwitterUI)

      return () => {
        log('call useEffect cleanup')
        window.removeEventListener('load', observeTwitterUI)
        window.removeEventListener('unload', unobserveTwitterUI)
      }
    }
  }, [])

  return draft
}
