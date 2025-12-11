import type { ProcessMessage } from '~/models/ProcessMessage'

export const sendDebugLog = (payload: any) => {
    if (process.env.NODE_ENV !== 'development') return

    const message: ProcessMessage = {
        type: 'Log',
        payload,
    }
    // Fire and forget
    chrome.runtime.sendMessage(message).catch(() => {
        // Ignore errors (e.g. background script not ready)
    })
}
