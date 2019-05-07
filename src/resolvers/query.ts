import { errorName } from '../define/errors'
import Post from '../models/post'
import User from '../models/user'
import * as T from '../types/resolver'

export const posts = () => Post.find()

export const users = () => User.find()

export const user = async (parent: T.Parent, _args: T.Args, { user }: any) => {
  if (!user) {
    throw new Error(errorName.UNAUTHORIZED)
  }

  return User.findById(user._id)
}
