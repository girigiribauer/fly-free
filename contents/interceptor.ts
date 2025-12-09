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

window.addEventListener('message', (event) => {
    if (event.source !== window) return

    if (event.data?.type === 'FLY_FREE_CLEANUP') {
        capturedListeners.forEach(({ listener, options }) => {
            window.removeEventListener('beforeunload', listener, options)
        })

        window.onbeforeunload = null
    }
})
