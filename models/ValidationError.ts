export type ValidationError =
    | { type: 'NoDraft' }
    | { type: 'NoText' }
    | { type: 'NoCredentials' }
    | { type: 'TextTooLong'; maxLength: number }
    | { type: 'ParseInvalid' }
