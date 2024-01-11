import { useCallback, useEffect, useState } from 'react'

import { captureDraft, queryFromUnstableDOM } from '~/libs/twitterDOM'
import type { Draft } from '~/models/Draft'

export const useScanDraft = (
  container: HTMLElement | undefined,
  handleSubmit: () => void,
): Draft | null => {
  let textareaObserver: MutationObserver

  const [draft, setDraft] = useState<Draft | null>(null)

  const handleInterceptMetaKey = useCallback(
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

  const observeTwitterDOM = useCallback(() => {
    const handleDOMChanges = () => {
      const { textarea, attachments, linkcard } = queryFromUnstableDOM()

      if (textarea) {
        textarea.removeEventListener('keydown', handleInterceptMetaKey)
        textarea.addEventListener('keydown', handleInterceptMetaKey)
      }

      const draft = captureDraft({ textarea, attachments, linkcard })
      setDraft(draft)
    }

    textareaObserver = new MutationObserver(handleDOMChanges)
    textareaObserver.observe(container, {
      attributes: true,
      childList: true,
      subtree: true,
      characterData: true,
    })
  }, [container])

  const unobserveTwitterDOM = useCallback(() => {
    textareaObserver?.disconnect()
  }, [])

  useEffect(() => {
    if (!container) return
    if (document.readyState === 'complete') {
      observeTwitterDOM()
      return unobserveTwitterDOM
    } else {
      window.addEventListener('load', observeTwitterDOM)

      return () => {
        window.removeEventListener('load', observeTwitterDOM)
        unobserveTwitterDOM()
      }
    }
  }, [container])

  return draft
}
