import { useEffect } from 'react'

import { debounce } from '~/libs/debounce'

export const useResizeAndReload = () => {
  const handleResize = () => {
    location.reload()
  }
  const handleDebouncedResize = debounce(handleResize)

  useEffect(() => {
    window.addEventListener('resize', handleDebouncedResize)

    return () => {
      window.removeEventListener('resize', handleDebouncedResize)
    }
  })
}
