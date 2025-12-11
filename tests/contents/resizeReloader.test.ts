// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('resizeReloader', () => {
    let originalAddEventListener: typeof window.addEventListener
    let originalRemoveEventListener: typeof window.removeEventListener
    let originalReload: typeof location.reload

    // Track listeners to cleanup
    const addedListeners: Array<[string, EventListenerOrEventListenerObject, boolean | AddEventListenerOptions | undefined]> = []

    beforeEach(() => {
        // Mock reload
        originalReload = window.location.reload
        Object.defineProperty(window, 'location', {
            configurable: true,
            value: { ...window.location, reload: vi.fn() },
        })

        // Capture listeners to cleanup
        const currentAddEventListener = window.addEventListener
        originalAddEventListener = currentAddEventListener // Save for restore
        originalRemoveEventListener = window.removeEventListener

        window.addEventListener = function (type, listener, options) {
            addedListeners.push([type, listener, options])
            return currentAddEventListener.call(this, type, listener, options)
        }

        window.onbeforeunload = null

        // Use fake timers
        vi.useFakeTimers()

        // Reset modules to re-execute the script
        vi.resetModules()
    })

    afterEach(() => {
        // Cleanup all listeners added during test
        addedListeners.forEach(([type, listener, options]) => {
            originalRemoveEventListener.call(window, type, listener, options)
        })
        addedListeners.length = 0

        // Restore window state
        window.addEventListener = originalAddEventListener
        window.removeEventListener = originalRemoveEventListener
        Object.defineProperty(window, 'location', {
            configurable: true,
            value: { ...window.location, reload: originalReload },
        })
        vi.useRealTimers()
        vi.restoreAllMocks()
    })

    // Helper to load the script
    const loadScript = async () => {
        await import('../../contents/resizeReloader')
    }

    it('beforeunloadイベントリスナーが捕捉されること', async () => {
        await loadScript()
        // No assertion needed for capture itself, implied by cleanup test
    })

    it('リサイズ時に捕捉されたリスナーが即座に削除され、onbeforeunloadが無効化されること', async () => {
        // Spy on removeEventListener
        const removeSpy = vi.spyOn(window, 'removeEventListener')

        await loadScript()

        const listener = () => { }
        window.addEventListener('beforeunload', listener)
        window.onbeforeunload = () => { }

        expect(window.onbeforeunload).not.toBeNull()

        // Trigger Resize
        window.dispatchEvent(new Event('resize'))

        // Expect Immediate Cleanup
        expect(removeSpy).toHaveBeenCalledWith('beforeunload', listener, undefined)
        expect(window.onbeforeunload).toBeNull()
    })

    it('リサイズ後、500msのデバウンスを経てページがリロードされること', async () => {
        await loadScript()
        const reloadSpy = vi.mocked(window.location.reload)

        // Trigger Resize
        window.dispatchEvent(new Event('resize'))

        expect(reloadSpy).not.toHaveBeenCalled()

        // Advance timer
        vi.advanceTimersByTime(250)
        expect(reloadSpy).not.toHaveBeenCalled()

        vi.advanceTimersByTime(250)
        expect(reloadSpy).toHaveBeenCalledTimes(1)
    })

    it('500ms以内に再度リサイズされた場合、デバウンスタイマーがリセットされること', async () => {
        await loadScript()
        const reloadSpy = vi.mocked(window.location.reload)

        // 1st Resize
        window.dispatchEvent(new Event('resize'))
        vi.advanceTimersByTime(400)

        // 2nd Resize
        window.dispatchEvent(new Event('resize'))

        // Should NOT have reloaded yet (Timer 1 cancelled)
        vi.advanceTimersByTime(200)
        expect(reloadSpy).not.toHaveBeenCalled()

        // Wait remaining time for Timer 2
        vi.advanceTimersByTime(350)
        expect(reloadSpy).toHaveBeenCalledTimes(1)
    })

    it('FLY_FREE_CLEANUP メッセージを受信した際、クリーンアップが実行されること', async () => {
        const removeSpy = vi.spyOn(window, 'removeEventListener')
        await loadScript()

        const listener = () => { }
        window.addEventListener('beforeunload', listener)

        // Dispatch Message manually to ensure correct event shape and synchronous execution
        // window.postMessage behavior in happy-dom can be tricky with event.source
        const event = new MessageEvent('message', {
            data: { type: 'FLY_FREE_CLEANUP' },
            source: window,
        })
        window.dispatchEvent(event)

        // Expect Cleanup
        expect(removeSpy).toHaveBeenCalledWith('beforeunload', listener, undefined)
    })
})
