import { useMemo, type Ref } from 'react'

import style from '~/components/SubmitButton.module.css'
import type { DeliveryAgentState } from '~/models/DeliveryAgentState'
import type { SocialMedia } from '~/models/SocialMedia'

export type SubmitButtonProps = {
  innerRef: Ref<HTMLButtonElement>
  delivery: DeliveryAgentState
  validRecipients: SocialMedia[]
  handleSubmit: () => void
}

export const SubmitButton = ({
  innerRef,
  delivery,
  validRecipients,
  handleSubmit,
}: SubmitButtonProps) => {
  const disabled = validRecipients.length <= 0 || delivery.type !== 'Writing'

  const label = useMemo(() => {
    switch (delivery.type) {
      case 'Initial':
      case 'Writing':
        return 'Crosspost'
      case 'OnDelivery':
        return 'Crossposting'
      case 'Delivered':
        return 'Crossposted'
    }
  }, [delivery])

  return (
    <button
      className={style.submit}
      disabled={disabled}
      type="button"
      ref={innerRef}
      onClick={handleSubmit}>
      {label}
    </button>
  )
}
