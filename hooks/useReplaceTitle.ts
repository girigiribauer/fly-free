import { useEffect } from 'react'

import { ContentPageTitle } from '~/definitions'

export const useReplaceTitle = () => {
  let titleObserver: MutationObserver

  useEffect(() => {
    titleObserver = new MutationObserver(() => {
      const currentTitle = document.title
      if (currentTitle === ContentPageTitle) return

      document.title = ContentPageTitle
    })

    titleObserver?.observe(document.head, {
      childList: true,
      subtree: true,
    })

    return () => {
      titleObserver?.disconnect()
    }
  }, [])
}
