import { errorName } from '../define/errors'

export const withAuth = (next: any) => (parent: any, args: any, context: any) => {
  if (!context.user) {
    throw new Error(errorName.UNAUTHORIZED)
  }

  return next(parent, args, context)
}
