import { useCallback, useMemo } from 'react'

import { useScanDraft } from '~/hooks/useScanDraft'
import { usePreference } from '~/hooks/usePreference'
import { computeValidationResults } from '~/libs/validation'

export const useDraftScanner = (
    containerRef: React.MutableRefObject<HTMLElement>,
    submitRef: React.MutableRefObject<HTMLButtonElement | undefined>,
) => {
    const pref = usePreference()

    const handleSubmitProxy = useCallback(() => {
        if (!submitRef.current) return
        const button: HTMLButtonElement = submitRef.current
        if (button.disabled) return
        button.click()
    }, [submitRef])

    const draft = useScanDraft(containerRef.current, handleSubmitProxy)

    const validationResults = useMemo(
        () => computeValidationResults(draft, pref),
        [draft, pref],
    )

    return {
        draft,
        validationResults,
    }
}
