import iconExternal from 'data-base64:~/assets/icon-external.svg'
import { useEffect, useState } from 'react'

import style from '~/components/DeliveryView.module.css'
import { SocialMediaIcon } from '~/components/SocialMediaIcon'
import type { SocialMediaIconType } from '~/components/SocialMediaIcon'
import type { DeliveryAgentState } from '~/models/DeliveryAgentState'
import { cleanDraftText } from '~/libs/DraftUtils'
import type { Draft } from '~/models/Draft'

export type DeliveryViewProps = {
  delivery: DeliveryAgentState
  draft: Draft | null
  isAutoclosing: Boolean
  dryRun: Boolean
  handleClose: () => void
}

export const DeliveryView = ({
  delivery,
  draft,
  isAutoclosing,
  dryRun,
  handleClose,
}: DeliveryViewProps) => {
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [showToast])

  const [count, setCount] = useState<number | null>(null)

  const iconTypes: Record<string, SocialMediaIconType> = {
    Posting: 'Valid',
    Success: 'Success',
    Error: 'Invalid',
  }

  const { type } = delivery

  useEffect(() => {
    if (!isAutoclosing) {
      if (count !== null) {
        setCount(null)
      }
      return
    }
    if (type !== 'Delivered') return

    const allSuccess = delivery.recipients.every((r) => r.type === 'Success')
    let timer: NodeJS.Timeout

    if (allSuccess) {
      if (count === null) {
        setCount(5)
        return
      }

      if (count <= 0) {
        return
      }

      timer = setTimeout(() => {
        const nextTime = count - 1
        setCount(nextTime)

        if (nextTime <= 0) {
          handleClose()
        }
      }, 1000)
    }

    return () => {
      clearTimeout(timer)
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
              <div
                className={style.recipientResult}
                title={result.error}>
                <span className={style.recipientLabel}>Error...</span>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
      {count !== null ? (
        <p className={style.autoclosing}>Auto closing: {count}</p>
      ) : null}

      {draft ? (
        <div className={style.draftArea}>
          <textarea
            className={style.draftText}
            readOnly
            value={cleanDraftText(draft.text)}
            onClick={(e) => (e.target as HTMLTextAreaElement).select()}
          />
          <button
            className={style.copyIcon}
            title="Copy to clipboard"
            onClick={() => {
              navigator.clipboard.writeText(cleanDraftText(draft.text))
              setShowToast(true)
            }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2-2v1"></path>
            </svg>
          </button>
          {showToast && <div className={style.toast}>Copied!</div>}
        </div>
      ) : null}


      {process.env.NODE_ENV === 'development' ? (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '8px',
          fontSize: '12px',
          zIndex: 9999
        }}>
          <p>Type: {type}</p>
          <p>AutoClosing: {String(isAutoclosing)}</p>
          <p>DryRun: {String(dryRun)}</p>
          <p>AllSuccess: {String(delivery.recipients.every((r) => r.type === 'Success'))}</p>
          <p>Count: {count}</p>
        </div>
      ) : null}
    </div>
  )
}
