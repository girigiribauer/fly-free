import type { Draft } from '~/models/Draft'
import type { PostMessageState } from '~/models/PostMessageState'

export type DeliveryAgentState =
  | DeliveryAgentStateInitial
  | DeliveryAgentStateWriting
  | DeliveryAgentStateOnDelivery
  | DeliveryAgentStateDelivered

export type DeliveryAgentStateInitial = {
  type: 'Initial'
}

export type DeliveryAgentStateWriting = {
  type: 'Writing'
  recipients: PostMessageState[]
}

export type DeliveryAgentStateOnDelivery = {
  type: 'OnDelivery'
  recipients: PostMessageState[]
  draft: Draft
}

export type DeliveryAgentStateDelivered = {
  type: 'Delivered'
  recipients: PostMessageState[]
  draft: Draft
}
