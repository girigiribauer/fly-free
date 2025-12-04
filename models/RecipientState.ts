import type { SocialMedia } from '~/models/SocialMedia'

export type RecipientState =
  | RecipientStateInitial
  | RecipientStateWriting
  | RecipientStatePosting
  | RecipientStateSuccess
  | RecipientStateError

export type RecipientStateInitial = {
  type: 'Initial'
  recipient: SocialMedia
}

export type RecipientStateWriting = {
  type: 'Writing'
  recipient: SocialMedia
  paused: boolean
}

export type RecipientStatePosting = {
  type: 'Posting'
  recipient: SocialMedia
}

export type RecipientStateSuccess = {
  type: 'Success'
  recipient: SocialMedia
  url: string
}

export type RecipientStateError = {
  type: 'Error'
  recipient: SocialMedia
  error: string
}
