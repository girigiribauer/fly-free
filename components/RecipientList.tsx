import { useCallback } from 'react'

import style from '~/components/RecipientList.module.css'
import { SocialMediaIcon } from '~/components/SocialMediaIcon'
import type { SocialMediaIconType } from '~/components/SocialMediaIcon'
import type { PostMessageState } from '~/models/PostMessageState'
import type { SocialMedia } from '~/models/SocialMedia'

export type RecipientListProps = {
  recipients: PostMessageState[]
  handleSwitch: (recipient: SocialMedia, paused: boolean) => void
  dryRun?: boolean
  handleDryRunChange?: (checked: boolean) => void
}

export const RecipientList = ({
  recipients,
  handleSwitch,
  dryRun,
  handleDryRunChange,
}: RecipientListProps) => {
  const getIconType: (recipient: PostMessageState) => SocialMediaIconType =
    useCallback((recipient) => {
      if (recipient.type !== 'Writing') return 'Initial'
      if (recipient.paused) return 'Paused'

      return recipient.postValidate.type
    }, [])

  return (
    <ul className={style.container}>
      {recipients.map((recipient) => {
        if (recipient.type !== 'Writing') {
          return null
        }
        const { paused, recipient: name } = recipient
        return (
          <li key={name} onClick={() => handleSwitch(name, !paused)}>
            <SocialMediaIcon type={getIconType(recipient)} media={name} />
          </li>
        )
      })}
      {process.env.NODE_ENV === 'development' && handleDryRunChange ? (
        <li>
          <input
            type="checkbox"
            checked={dryRun}
            onChange={(e) => handleDryRunChange(e.target.checked)}
            title="Dry Run Mode"
            style={{ margin: '0 8px', cursor: 'pointer' }}
          />
        </li>
      ) : null}
    </ul>
  )
}
