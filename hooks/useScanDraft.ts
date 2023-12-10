import { useCallback, useEffect, useState } from 'react'

import {
  SelectorAttachments,
  SelectorCardDomain,
  SelectorCardWrapper,
  SelectorDroppedImage,
  SelectorTextarea,
} from '~/definitions'
import { debounce } from '~/libs/debounce'
import { createDraft } from '~/models/Draft'
import type { Draft } from '~/models/Draft'

export const useScanDraft = (
  container: HTMLElement | undefined,
  handleSubmit: () => void,
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

  const observeTwitterUI = useCallback(() => {
    let textarea: HTMLDivElement
    let attachments: HTMLDivElement
    let cardWrapper: HTMLDivElement

    // TODO:
    // - detectable changes
    // - be robust to changes
    // - beautify
    const callback = () => {
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
    }

    textareaObserver = new MutationObserver(debounce(callback))
    textareaObserver.observe(container, {
      attributes: true,
      childList: true,
      subtree: true,
      characterData: true,
    })
  }, [container])

  const unobserveTwitterUI = useCallback(() => {
    textareaObserver?.disconnect()
  }, [])

  useEffect(() => {
    if (!container) return
    if (document.readyState === 'complete') {
      observeTwitterUI()
      return unobserveTwitterUI
    } else {
      window.addEventListener('load', observeTwitterUI)

      return () => {
        window.removeEventListener('load', observeTwitterUI)
        unobserveTwitterUI()
      }
    }
  }, [container])

  return draft
}
