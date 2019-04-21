import * as E from '../define/errors'

export const getErrorType = (errorName: string) => {
  let errorType: any = E.errorType

  return errorType[errorName]
}
