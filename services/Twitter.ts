import twitter from 'twitter-text'

import type { Draft } from '~/models/Draft'
import type { Post } from '~/models/Post'
import type { PostValidateState } from '~/models/PostValidateState'
import type { Preference } from '~/models/Preference'

export const checkValidation = (
  draft: Draft,
  pref: Preference,
): PostValidateState => {
  if (!draft) {
    return {
      type: 'Invalid',
      errors: ['no draft'],
    }
  }

  const { text, imageURLs } = draft

  if (!text || text.length === 0) {
    const hasNoImage = !imageURLs || imageURLs.length === 0
    if (hasNoImage) {
      return {
        type: 'Invalid',
        errors: ['no text'],
      }
    } else {
      return {
        type: 'Valid',
      }
    }
  }

  const { valid } = twitter.parseTweet(text)
  if (!valid) {
    return {
      type: 'Invalid',
      errors: ['parse invalid'],
    }
  }

  return {
    type: 'Valid',
  }
}

export const post = async (post: Post, pref: Preference): Promise<string> => {
  // noop
  return 'https://twitter.com'
}
