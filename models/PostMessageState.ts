import type { PostValidateState } from '~/models/PostValidateState'
import type { SocialMedia } from '~/models/SocialMedia'

export type PostMessageState =
  | PostMessageStateInitial
  | PostMessageStateWriting
  | PostMessageStatePosting
  | PostMessageStateSuccess
  | PostMessageStateError
  | PostMessageStateUnknown

export type PostMessageStateInitial = {
  type: 'Initial'
  recipient: SocialMedia
}

export type PostMessageStateWriting = {
  type: 'Writing'
  recipient: SocialMedia
  paused: boolean
  postValidate?: PostValidateState
}

export type PostMessageStatePosting = {
  type: 'Posting'
  recipient: SocialMedia
}

export type PostMessageStateSuccess = {
  type: 'Success'
  recipient: SocialMedia
  url: string
}

export type PostMessageStateError = {
  type: 'Error'
  recipient: SocialMedia
  error: string
}

export type PostMessageStateUnknown = {
  type: 'Unknown'
  recipient: SocialMedia
}
