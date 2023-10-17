import { useCallback, useMemo } from 'react'

import style from '~/components/EnableServices.module.css'
import { ServiceIcon, type ServiceIconType } from '~/components/ServiceIcon'
import type { Draft } from '~/models/Draft'
import type { Service } from '~/models/frontend/Service'
import type { ServiceName } from '~/models/ServiceName'

export type EnableServicesProps = {
  services: Service[]
  draft: Draft | null
}

export const EnableServices = ({ services, draft }: EnableServicesProps) => {
  if (!draft) return null

  const serviceStatuses = useMemo<{ [T in ServiceName]: ServiceIconType }>(
    () =>
      Object.fromEntries(
        services.map((s) => [s.service, s.getStatus(draft).type]),
      ) as { [T in ServiceName]: ServiceIconType },
    [services, draft],
  )

  const handleSwitchPausing = useCallback(
    (service: ServiceName) => {
      const found = services.find((s) => s.service === service)
      if (!found) return

      found.switchPausing(!found.store.data?.paused)
    },
    [services, draft],
  )

  return services.length > 0 ? (
    <ul className={style.container}>
      {services.map(({ iconURL, service }) => (
        <li key={service} onClick={() => handleSwitchPausing(service)}>
          <ServiceIcon
            type={serviceStatuses[service]}
            service={service}
            iconURL={iconURL}
          />
        </li>
      ))}
    </ul>
  ) : (
    <div className={style.container}>
      <p>There are no enabled services. (Click Options)</p>
    </div>
  )
}
