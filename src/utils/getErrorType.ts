import * as E from '../config/errors'

export const getErrorType = (errorName: string) => {
  let errorType: any = E.errorType

  return errorType[errorName]
}
