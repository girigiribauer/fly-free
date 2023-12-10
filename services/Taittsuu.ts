import type { Draft } from '~/models/Draft'
import type { Post } from '~/models/Post'
import type { PostValidateState } from '~/models/PostValidateState'
import type { Preference } from '~/models/Preference'

export const checkValidation = (
  draft: Draft,
  pref: Preference,
): PostValidateState => {
  return {
    type: 'Invalid',
    errors: ['unimplemented'],
  }
}

export const post = async (post: Post, pref: Preference): Promise<string> => {
  throw new Error('unimplemented')
}
