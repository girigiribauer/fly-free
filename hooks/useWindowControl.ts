import { useCallback, useEffect } from 'react'
import { debounce } from '~/libs/debounce'

export const useWindowControl = () => {
    useEffect(() => {
        const handleResize = () => {
            location.reload()
        }
        const handleDebouncedResize = debounce(handleResize)

        window.addEventListener('resize', handleDebouncedResize)

        return () => {
            window.removeEventListener('resize', handleDebouncedResize)
        }
    }, [])

    const handleClose = useCallback(() => {
        // beforeunload イベントのキャンセル
        window.postMessage({ type: 'FLY_FREE_CLEANUP' }, '*')

        // 実際に閉じる
        setTimeout(() => {
            chrome.runtime.sendMessage({ type: 'CloseWindow' })
        }, 50)
    }, [])

    return { handleClose }
}
