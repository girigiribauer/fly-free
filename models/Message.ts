import type { ServiceName } from '~/models/ServiceName'
import type {
  ServiceResultError,
  ServiceResultSuccess,
} from '~/models/ServiceResult'

export type Message = MessagePost | MessageSuccess | MessageError | MessageTweet

export type MessagePost = {
  type: 'Post'
  draft: string
  services: ServiceName[]
}

export type MessageSuccess = ServiceResultSuccess

export type MessageError = ServiceResultError

export type MessageTweet = {
  type: 'Tweet'
}
