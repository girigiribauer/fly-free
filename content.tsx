import type { PlasmoCSConfig } from 'plasmo'
import { useCallback, useRef } from 'react'

import { ComposerHeader } from '~/components/ComposerHeader'
import { DeliveryView } from '~/components/DeliveryView'
import { useDraftScanner } from '~/hooks/orchestrator/useDraftScanner'
import { useReplaceTitle } from '~/hooks/useReplaceTitle'
import { useResizeAndReload } from '~/hooks/useResizeAndReload'
import { usePreference } from '~/hooks/usePreference'
import { useDeliveryAgent } from '~/hooks/useDeliveryAgent'
import { useRecipientSwitch } from '~/hooks/useRecipientSwitch'
import { getContentStyle } from '~/libs/contentStyles'
import { updateStore } from '~/models/Store'

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
  useResizeAndReload()

  const { delivery, recipients, validRecipients, handleSubmit } = useDeliveryAgent(draft, pref)

  const { handleSwitch } = useRecipientSwitch()

  const handleClose = useCallback(() => {
    window.close()
  }, [])

  return (
    <>
      <ComposerHeader
        submitRef={submitRef}
        delivery={delivery}
        recipients={recipients}
        validRecipients={validRecipients}
        forceBlank={pref.globalForceblank}
        dryRun={pref.dryRun}
        handleSwitch={handleSwitch}
        handleDryRunChange={(checked) => updateStore({ dryRun: checked })}
        handleSubmit={handleSubmit}
      />
      <DeliveryView
        delivery={delivery}
        isAutoclosing={pref.globalAutoclosing}
        handleClose={handleClose}
      />
    </>
  )
}

export default Overlay
