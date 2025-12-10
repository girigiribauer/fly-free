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

