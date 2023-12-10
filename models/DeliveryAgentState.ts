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
}

export type DeliveryAgentStateDelivered = {
  type: 'Delivered'
  recipients: PostMessageState[]
}
