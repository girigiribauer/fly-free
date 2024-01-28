import type { PostImage } from '~/models/PostImage'

export type PostLinkcard = {
  url: string
  thumbnail: PostImage
  title: string
  description: string
}
