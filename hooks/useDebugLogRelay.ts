import { useEffect } from 'react'

import type { ProcessMessage } from '~/models/ProcessMessage'

/**
 * Listens for debug logs sent from the Main World (e.g. resizeReloader) via window.postMessage,
 * and relays them to the Background script for unified logging in the DevTools console.
 */
export const useDebugLogRelay = () => {
    useEffect(() => {
        const handleRelay = (event: MessageEvent) => {
            // Security check: only accept messages from self
            if (event.source !== window) return

            if (event.data?.type === 'FLY_FREE_LOG_RELAY') {
                const message: ProcessMessage = {
                    type: 'Log',
                    payload: `[DEBUG-MW] ${event.data.payload}`,
                }
                chrome.runtime.sendMessage(message).catch(() => {
                    // Ignore errors (e.g. background script invalidation)
                })
            }
        }

        window.addEventListener('message', handleRelay)
        return () => window.removeEventListener('message', handleRelay)
    }, [])
}
