import type { ServiceName } from '~/models/ServiceName'

export interface ServicePreference {
  service: ServiceName
  enabled: boolean
  paused: boolean
  username?: string
  password?: string
}
