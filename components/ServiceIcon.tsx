import iconCaution from 'data-base64:~/assets/icon-caution.svg'
import iconPause from 'data-base64:~/assets/icon-paused.svg'
import iconSuccess from 'data-base64:~/assets/icon-success.svg'

import style from '~/components/ServiceIcon.module.css'
import type { ServiceName } from '~/models/ServiceName'

export type ServiceIconType = 'Valid' | 'Paused' | 'Invalid' | 'Success'

export type ServiceIconProps = {
  type: ServiceIconType
  service: ServiceName
  iconURL: string
}

export const ServiceIcon = ({ service, type, iconURL }: ServiceIconProps) => {
  const statusClasses: { [T in ServiceIconType]: string } = {
    Valid: style.valid,
    Paused: style.paused,
    Invalid: style.invalid,
    Success: style.success,
  }
  const classNames = [style.container, statusClasses[type]]

  return (
    <div className={classNames.join(' ')}>
      <img
        src={iconURL}
        className={style.snsIcon}
        alt={service}
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
