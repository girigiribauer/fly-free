import iconBluesky from 'data-base64:~/assets/icon-bluesky.svg'
import iconCaution from 'data-base64:~/assets/icon-caution.svg'
import iconPause from 'data-base64:~/assets/icon-paused.svg'
import iconSuccess from 'data-base64:~/assets/icon-success.svg'
import iconTwitter from 'data-base64:~/assets/icon-twitter.svg'

import style from '~/components/SocialMediaIcon.module.css'
import type { SocialMedia } from '~/models/SocialMedia'

export type SocialMediaIconType =
  | 'Initial'
  | 'Valid'
  | 'Paused'
  | 'Invalid'
  | 'Success'

export type SocialMediaIconProps = {
  type: SocialMediaIconType
  media: SocialMedia
}

export const SocialMediaIcon = ({ media, type }: SocialMediaIconProps) => {
  const iconURLs: { [key in SocialMedia]: string } = {
    Twitter: iconTwitter,
    Bluesky: iconBluesky,
  }
  const statusClasses: { [key in SocialMediaIconType]: string } = {
    Initial: style.initial,
    Valid: style.valid,
    Paused: style.paused,
    Invalid: style.invalid,
    Success: style.success,
  }
  const classNames = [style.container, statusClasses[type]]

  return (
    <div className={classNames.join(' ')}>
      <img
        src={iconURLs[media]}
        className={style.icon}
        alt={media}
        width="40"
        height="40"
      />
      {type === 'Paused' ? (
        <img
          src={iconPause}
          className={style.iconNote}
          alt=""
          width="14"
          height="14"
        />
      ) : null}
      {type === 'Invalid' ? (
        <img
          src={iconCaution}
          className={style.iconNote}
          alt=""
          width="14"
          height="14"
        />
      ) : null}
      {type === 'Success' ? (
        <img
          src={iconSuccess}
          className={style.iconNote}
          alt=""
          width="14"
          height="14"
        />
      ) : null}
    </div>
  )
}
