import iconExternal from 'data-base64:~/assets/icon-external.svg'
import { useMemo } from 'react'

import style from '~/components/PostResultView.module.css'
import { ServiceIcon, type ServiceIconType } from '~/components/ServiceIcon'
import type { Service as ServiceFrontend } from '~/models/frontend/Service'
import type { PostStatus } from '~/models/PostStatus'

export type PostResultViewProps = {
  services: ServiceFrontend[]
  postStatus: PostStatus
}

export const PostResultView = ({
  services,
  postStatus,
}: PostResultViewProps) => {
  const iconURLs = useMemo(() => {
    const icons = {}
    services.forEach((s) => {
      icons[s.service] = s.iconURL
    })
    return icons
  }, [services])

  const iconTypes: Record<string, ServiceIconType> = {
    Posting: 'Valid',
    Success: 'Success',
    Error: 'Invalid',
  }

  if (postStatus.type !== 'Process' && postStatus.type !== 'Output') return null

  return (
    <ul className={style.container}>
      {postStatus.results.map((result) => (
        <li key={result.service} className={style.postStatus}>
          <ServiceIcon
            type={iconTypes[result.type]}
            service={result.service}
            iconURL={iconURLs[result.service]}
          />

          {result.type === 'Posting' ? (
            <div className={style.postStatusResult}>
              <span className={style.postStatusLabel}>Posting...</span>
            </div>
          ) : null}

          {result.type === 'Success' ? (
            <a
              className={style.postStatusResult}
              href={result.url}
              target="_blank">
              <span className={style.postStatusLabel}>Success!</span>
              <img
                className={style.postStatusExternal}
                src={iconExternal}
                alt=""
                width="16"
                height="16"
              />
            </a>
          ) : null}

          {result.type === 'Error' ? (
            <div className={style.postStatusResult}>
              <span className={style.postStatusLabel} title={result.message}>
                Error...
              </span>
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  )
}
