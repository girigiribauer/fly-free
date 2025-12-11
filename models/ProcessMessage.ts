import type {
  PostMessageState,
  PostMessageStateError,
  PostMessageStateSuccess,
} from '~/models/PostMessageState'

export type ProcessMessage =
  | ProcessMessagePost
  | ProcessMessageSuccess
  | ProcessMessageError
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

