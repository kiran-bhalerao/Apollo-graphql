import * as E from '../constants/errors'

export const getErrorType = (errorName: string) => {
  let errorType: any = E.errorType

  return errorType[errorName]
}
