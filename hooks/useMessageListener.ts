import { useEffect } from 'react'
import type { ProcessMessage } from '~/models/ProcessMessage'

export const useMessageListener = (
    handler: (message: ProcessMessage) => void,
) => {
    useEffect(() => {
        const listener = (message: any) => {
            handler(message)
        }
        chrome.runtime.onMessage.addListener(listener)
        return () => {
            chrome.runtime.onMessage.removeListener(listener)
        }
    }, [handler])
}
