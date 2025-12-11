import { useCallback } from 'react'
import { sendDebugLog } from '~/libs/remoteLogger'

export const useWindowControl = () => {
    const handleClose = useCallback(() => {
        sendDebugLog('handleClose called')
        // beforeunload イベントのキャンセル (Phase 2 handler will pick this up)
        window.postMessage({ type: 'FLY_FREE_CLEANUP' }, '*')

        // 実際に閉じる
        setTimeout(() => {
            chrome.runtime.sendMessage({ type: 'CloseWindow' })
        }, 50)
    }, [])

    return { handleClose }
}
