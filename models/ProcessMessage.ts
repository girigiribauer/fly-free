import type {
  PostMessageState,
  PostMessageStateError,
  PostMessageStateSuccess,
  PostMessageStateUnknown,
} from '~/models/PostMessageState'

export type ProcessMessage =
  | ProcessMessagePost
  | ProcessMessageSuccess
  | ProcessMessageError
  | ProcessMessageUnknown
  | ProcessMessageTweet
  | ProcessMessageCloseWindow
  | ProcessMessageLog

export type ProcessMessagePost = {
  type: 'Post'
  draft: string
  recipients: PostMessageState[]
}

export type ProcessMessageSuccess = PostMessageStateSuccess

export type ProcessMessageError = PostMessageStateError

export type ProcessMessageUnknown = PostMessageStateUnknown

export type ProcessMessageTweet = {
  type: 'Tweet'
}

export type ProcessMessageCloseWindow = {
  type: 'CloseWindow'
}

export type ProcessMessageLog = {
  type: 'Log'
  payload: any
}

