import type { PostImage } from '~/models/PostImage'
import type { PostLinkcard } from '~/models/PostLinkcard'

export type Post = {
  text: string
  images: PostImage[]
  linkcard: PostLinkcard | null
}
