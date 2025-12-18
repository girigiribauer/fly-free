import type { PlasmoCSConfig } from 'plasmo'
import { useEffect, useRef, useState } from 'react'

import { ComposerHeader } from '~/components/ComposerHeader'
import { DeliveryView } from '~/components/DeliveryView'
import { useDraftScanner } from '~/hooks/orchestrator/useDraftScanner'
import { useReplaceTitle } from '~/hooks/useReplaceTitle'
import { useWindowControl } from '~/hooks/useWindowControl'
import { usePreference } from '~/hooks/usePreference'
import { useDeliveryAgent } from '~/hooks/useDeliveryAgent'
import { useRecipientSwitch } from '~/hooks/useRecipientSwitch'
import { getContentStyle } from '~/libs/contentStyles'
import { useDebugLogRelay } from '~/hooks/useDebugLogRelay'

export const getStyle = getContentStyle

export const config: PlasmoCSConfig = {
  matches: [
    'https://twitter.com/intent/post?ff=1*',
    'https://x.com/intent/post?ff=1*',
  ],
  run_at: 'document_end',
}

const Overlay = () => {
  const submitRef = useRef<HTMLButtonElement>()
  const pref = usePreference()

  const containerRef = useRef(document.body)

  const { draft } = useDraftScanner(containerRef, submitRef)

  useReplaceTitle()

  // Initial text state
  const [initialText, setInitialText] = useState<string | null>(null)

  useEffect(() => {
    if (draft && initialText === null) {
      setInitialText(draft.text)
    }
  }, [draft, initialText])

  // Start listening for Main World logs
  useDebugLogRelay()

  // Ephemeral Dry Run state (Dev only)
  const [dryRun, setDryRun] = useState(false)

  const { delivery, recipients, validRecipients, handleSubmit } = useDeliveryAgent(draft, pref, dryRun)

  const { handleSwitch } = useRecipientSwitch()

  // Use new window control hook (handles resize and closing)
  const { handleClose } = useWindowControl()

  return (
    <>
      <ComposerHeader
        submitRef={submitRef}
        delivery={delivery}
        recipients={recipients}
        validRecipients={validRecipients}
        forceBlank={pref.globalForceblank}
        handleSwitch={handleSwitch}
        handleSubmit={handleSubmit}
        dryRun={dryRun}
        handleDryRunChange={setDryRun}
      />
      <DeliveryView
        delivery={delivery}
        draft={draft}
        isAutoclosing={pref.globalAutoclosing}
        handleClose={handleClose}
        dryRun={dryRun}
      />
    </>
  )
}

export default Overlay
