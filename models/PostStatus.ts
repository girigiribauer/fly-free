import type { Draft } from '~/models/Draft'
import type { ServiceResult } from '~/models/ServiceResult'
import type { ServiceStatus } from '~/models/ServiceStatus'

export type PostStatus =
  | PostStatusInitialize
  | PostStatusInput
  | PostStatusProcess
  | PostStatusOutput

export type PostStatusInitialize = {
  type: 'Initialize'
}

export type PostStatusInput = {
  type: 'Input'
  draft: Draft
  statuses: ServiceStatus[]
}

export type PostStatusProcess = {
  type: 'Process'
  results: ServiceResult[]
}

export type PostStatusOutput = {
  type: 'Output'
  results: ServiceResult[]
}
