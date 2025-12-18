import type { PlasmoCSConfig } from 'plasmo'

export const config: PlasmoCSConfig = {
    matches: ['https://twitter.com/intent/*', 'https://x.com/intent/*'],
    run_at: 'document_start',
    world: 'MAIN',
}

const originalAddEventListener = window.addEventListener
const capturedListeners: Array<{
    listener: EventListenerOrEventListenerObject
    options?: boolean | AddEventListenerOptions
}> = []

window.addEventListener = function (
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
) {
    if (type === 'beforeunload') {
        capturedListeners.push({ listener, options })
    }
    return originalAddEventListener.call(this, type, listener, options)
}

const cleanup = () => {
    if (capturedListeners.length > 0) {
        capturedListeners.forEach(({ listener, options }) => {
            window.removeEventListener('beforeunload', listener, options)
        })
        capturedListeners.length = 0 // Clear array
    }
    window.onbeforeunload = null
}

// Logic:
// 1. Resize detected -> Cleanup IMMEDIATELY (to race against any native immediate reload)
// 2. Timeout 500ms -> Force Reload (to ensure clean state if native reload didn't happen)
let isReloading = false
let debounceTimer: NodeJS.Timeout

import { sendDebugLog } from '~/libs/remoteLogger'

const handleResize = () => {
    // Immediate Cleanup
    sendDebugLog('[resizeReloader] Handle Resize Triggered')
    cleanup()

    if (isReloading) return

    // Cancel previous planned reload
    clearTimeout(debounceTimer)

    // Schedule new reload
    debounceTimer = setTimeout(() => {
        isReloading = true
        location.reload()
    }, 500)
}

window.addEventListener('resize', handleResize)

window.addEventListener('message', (event) => {
    if (event.source !== window) return
    if (event.data?.type === 'FLY_FREE_CLEANUP') {
        cleanup()
    }
})
