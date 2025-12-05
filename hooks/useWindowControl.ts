import { useCallback, useEffect, useRef } from 'react'
import { debounce } from '~/libs/debounce'

export const useWindowControl = (initialText: string | null) => {
    const isProgrammaticResize = useRef(false)

    // Handle manual resize (reload page to adjust layout)
    useEffect(() => {
        const handleResize = () => {
            if (isProgrammaticResize.current) {
                return
            }
            location.reload()
        }
        const handleDebouncedResize = debounce(handleResize)

        window.addEventListener('resize', handleDebouncedResize)

        return () => {
            window.removeEventListener('resize', handleDebouncedResize)
        }
    }, [])

    const handleClose = useCallback(async () => {
        // Flag to prevent reload on resize
        isProgrammaticResize.current = true

        // Strategy 1: UI Automation (Click Close -> Click Discard)
        // We keep the UI visible during automation for a better UX (no blank screen)

        // Resize window to force Twitter to render the close button (needs > 688px)
        if (window.outerWidth < 700) {
            try {
                window.resizeTo(1024, window.outerHeight)
            } catch (e) {
                console.error('[FlyFree] Resize failed:', e)
            }
            // Wait for React to re-render (reduced to 200ms)
            await new Promise((resolve) => setTimeout(resolve, 200))
        }

        const closeBtn =
            document.querySelector<HTMLElement>('[data-testid="app-bar-close"]') ||
            document.querySelector<HTMLElement>('[aria-label="閉じる"]') ||
            document.querySelector<HTMLElement>('[aria-label="Close"]')

        if (closeBtn) {
            // Ensure it's clickable
            closeBtn.style.display = 'block'
            closeBtn.style.visibility = 'visible'
            closeBtn.click()

            // Wait for modal (reduced to 300ms)
            await new Promise((resolve) => setTimeout(resolve, 300))

            const discardBtn = document.querySelector<HTMLElement>(
                '[data-testid="confirmationSheetConfirm"]',
            )
            if (discardBtn) {
                discardBtn.click()

                // Wait for click to register before closing (reduced to 50ms)
                setTimeout(() => {
                    chrome.runtime.sendMessage({ type: 'CloseWindow' })
                }, 50)
                return
            }
        } else {
        }

        // Strategy 2: Restore Initial Text (Fallback)

        // Hide the entire page ONLY for fallback to prevent visual glitch (double URL)
        document.body.style.display = 'none'

        const textarea = document.querySelector<HTMLDivElement>(
            '[data-testid="tweetTextarea_0"]',
        )

        if (textarea && initialText !== null) {
            textarea.focus()
            document.execCommand('selectAll', false, null)
            if (initialText === '') {
                document.execCommand('delete', false, null)
            } else {
                document.execCommand('insertText', false, initialText)
            }

            // Dispatch events to ensure React picks up the change
            textarea.dispatchEvent(new Event('input', { bubbles: true }))
            textarea.dispatchEvent(new Event('change', { bubbles: true }))

            textarea.blur()
        }

        // Close immediately to minimize race conditions
        setTimeout(() => chrome.runtime.sendMessage({ type: 'CloseWindow' }), 50)
    }, [initialText])

    return { handleClose }
}
