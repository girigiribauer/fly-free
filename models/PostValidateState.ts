export type PostValidateState =
  | PostValidateStateValid
  | PostValidateStateInvalid

export type PostValidateStateValid = {
  type: 'Valid'
}

export type PostValidateStateInvalid = {
  type: 'Invalid'
  errors: string[]
}
