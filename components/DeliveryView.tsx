import iconExternal from 'data-base64:~/assets/icon-external.svg'
import { useEffect, useRef, useState } from 'react'

import style from '~/components/DeliveryView.module.css'
import { SocialMediaIcon } from '~/components/SocialMediaIcon'
import type { SocialMediaIconType } from '~/components/SocialMediaIcon'
import type { DeliveryAgentState } from '~/models/DeliveryAgentState'

export type DeliveryViewProps = {
  delivery: DeliveryAgentState
  isAutoclosing: Boolean
  handleClose: () => void
}

export const DeliveryView = ({
  delivery,
  isAutoclosing,
  handleClose,
}: DeliveryViewProps) => {
  const [count, setCount] = useState<number | null>(null)

  const iconTypes: Record<string, SocialMediaIconType> = {
    Posting: 'Valid',
    Success: 'Success',
    Error: 'Invalid',
  }

  const { type } = delivery

  useEffect(() => {
    if (!isAutoclosing) return
    if (type !== 'Delivered') return

    const allSuccess = delivery.recipients.every((r) => r.type === 'Success')
    let timer: NodeJS.Timeout

    if (allSuccess) {
      const nextTime = count !== null ? count - 1 : 5
      if (count === null) {
        setCount(5)
      }
      timer = setTimeout(() => {
        setCount(nextTime)

        if (nextTime <= 0) {
          handleClose()
        }
      }, 1000)
    }

    return () => {
      clearInterval(timer)
    }
  }, [count, delivery, isAutoclosing, handleClose])

  if (type !== 'OnDelivery' && type !== 'Delivered') return null

  return (
    <div className={style.container}>
      <ul className={style.recipients}>
        {delivery.recipients.map((result) => (
          <li key={result.recipient} className={style.recipient}>
            <SocialMediaIcon
              type={iconTypes[result.type]}
              media={result.recipient}
            />

            {result.type === 'Posting' ? (
              <div className={style.recipientResult}>
                <span className={style.recipientLabel}>Posting...</span>
              </div>
            ) : null}

            {result.type === 'Success' ? (
              <a
                className={style.recipientResult}
                href={result.url}
                target="_blank">
                <span className={style.recipientLabel}>Success!</span>
                <img
                  className={style.recipientExternalIcon}
                  src={iconExternal}
                  alt=""
                  width="16"
                  height="16"
                />
              </a>
            ) : null}

            {result.type === 'Error' ? (
              <div className={style.recipientResult}>
                <span className={style.recipientLabel} title={result.error}>
                  Error...
                </span>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
      {count !== null ? (
        <p className={style.autoclosing}>Auto closing: {count}</p>
      ) : null}
    </div>
  )
}
