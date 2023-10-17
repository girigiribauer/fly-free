import type { ServiceName } from '~/models/ServiceName'

export type ServiceStatus =
  | ServiceStatusOff
  | ServiceStatusValid
  | ServiceStatusPaused
  | ServiceStatusInvalid

export type ServiceStatusOff = {
  type: 'Off'
  service: ServiceName
}

export type ServiceStatusValid = {
  type: 'Valid'
  service: ServiceName
}

export type ServiceStatusPaused = {
  type: 'Paused'
  service: ServiceName
}

export type ServiceStatusInvalid = {
  type: 'Invalid'
  service: ServiceName
}
