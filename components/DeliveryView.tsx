import iconExternal from 'data-base64:~/assets/icon-external.svg'

import style from '~/components/DeliveryView.module.css'
import { SocialMediaIcon } from '~/components/SocialMediaIcon'
import type { SocialMediaIconType } from '~/components/SocialMediaIcon'
import type { DeliveryAgentState } from '~/models/DeliveryAgentState'

export type DeliveryViewProps = {
  delivery: DeliveryAgentState
}

export const DeliveryView = ({ delivery }: DeliveryViewProps) => {
  const iconTypes: Record<string, SocialMediaIconType> = {
    Posting: 'Valid',
    Success: 'Success',
    Error: 'Invalid',
  }

  const { type } = delivery
  if (type !== 'OnDelivery' && type !== 'Delivered') return null

  const { recipients } = delivery
  return (
    <ul className={style.container}>
      {recipients.map((result) => (
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
  )
}
