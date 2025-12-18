import type { ProcessMessage } from '~/models/ProcessMessage'

export const sendDebugLog = (payload: any) => {
    if (process.env.NODE_ENV !== 'development') return

    // Main World (content scripts running in page context) does not have access to chrome.runtime
    // OR chrome.runtime exists but lacks internal APIs (checking .id is a reliable heuristic)
    if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.id) {
        // Relay to Isolated World via window.postMessage
        window.postMessage({
            type: 'FLY_FREE_LOG_RELAY',
            payload,
        }, '*')
        return
    }

    const message: ProcessMessage = {
        type: 'Log',
        payload,
    }
    // Fire and forget
    chrome.runtime.sendMessage(message).catch(() => {
        // Ignore errors (e.g. background script not ready)
    })
}
