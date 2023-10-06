import type { ServiceName } from '~/models/ServiceName'

export type ServiceResult =
  | ServiceResultPosting
  | ServiceResultSuccess
  | ServiceResultError

export type ServiceResultPosting = {
  type: 'Posting'
  service: ServiceName
}

export type ServiceResultSuccess = {
  type: 'Success'
  service: ServiceName
  url: string
}

export type ServiceResultError = {
  type: 'Error'
  service: ServiceName
  message: string
}
