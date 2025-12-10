import type { ValidationError } from '~/models/ValidationError'

export type PostValidateState =
  | PostValidateStateValid
  | PostValidateStateInvalid

export type PostValidateStateValid = {
  type: 'Valid'
}

export type PostValidateStateInvalid = {
  type: 'Invalid'
  errors: ValidationError[]
}
