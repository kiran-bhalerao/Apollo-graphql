import bcrypt from 'bcryptjs'
import { errorName } from '../constants/errors'
import { POST_CREATED } from '../constants/variables'
import Post from '../models/post'
import User from '../models/user'
import * as T from '../types/resolver'
import { getForgatePasswordTamplate } from '../utils/getForgatePasswordTamplate'
import getHash from '../utils/getHash'
import { createTokens } from '../utils/getToken'
import { getUuid } from '../utils/getUuid'
import sendMail from '../utils/sendMail'

export const createPost = async (_: T.Parent, { data }: T.Args, { pubsub, user }: any) => {
  if (!user) {
    throw new Error(errorName.UNAUTHORIZED)
  }

  const { title, description } = data
  const post = new Post({
    title,
    description,
    author: {
      id: user._id,
      username: user.username
    },
    createdAt: new Date(),
    updatedAt: new Date()
  })

  await User.findByIdAndUpdate(user._id, {
    $push: { posts: post._id }
  })

  await pubsub.publish(POST_CREATED, { createdPost: post })

  return post.save()
}

export const updatePost = async (_: T.Parent, { id, data }: T.Args, { user }: any) => {
  if (!user) {
    throw new Error(errorName.UNAUTHORIZED)
  }

  const hasPost = user.posts.some((post: string) => post.toString() === id)

  if (!hasPost) {
    throw new Error(errorName.INVALID_POST)
  }

  return Post.findByIdAndUpdate(
    id,
    {
      ...data,
      updatedAt: new Date()
    },
    { new: true }
  )
}

export const deletePost = async (_: T.Parent, { id }: T.Args, { user }: any) => {
  if (!user) {
    throw new Error(errorName.UNAUTHORIZED)
  }

  const hasPost = user.posts.some((post: string) => post.toString() === id)

  if (!hasPost) {
    throw new Error(errorName.INVALID_POST)
  }

  return Post.findByIdAndDelete(id)
}

export const deleteAllPosts = async (_: T.Parent, _args: T.Args, { user }: any) => {
  if (!user) {
    throw new Error(errorName.UNAUTHORIZED)
  }

  await Post.deleteMany({
    'author.id': user._id
  })

  return 'your all posts are deleted'
}

export const updateUser = async (_: T.Parent, { data }: T.Args, { user }: any) => {
  if (!user) {
    throw new Error(errorName.UNAUTHORIZED)
  }

  return User.findByIdAndUpdate(user._id, { ...data }, { new: true })
}

export const deleteUser = async (_: T.Parent, _args: T.Args, { user }: any) => {
  if (!user) {
    throw new Error(errorName.UNAUTHORIZED)
  }

  return User.findByIdAndDelete(user._id)
}

export const forgatePassword = async (_: T.Parent, { email }: T.Args, { redisClient }: any) => {
  const user: any = await User.findOne({ email })
  const key = getUuid()
  const uid = user._id.toString()
  await redisClient.set(key, uid, 'EX', 1800)

  const link = `${process.env.BASE_URL}/forgate/password/${key}`
  const subject = 'Forgate Password'
  const template = getForgatePasswordTamplate(link, user.username)

  sendMail(email, subject, template)

  return 'Check your mail and recreate your password.'
}

export const signup = async (_: T.Parent, { data }: T.Args) => {
  const { email, username, password } = data
  const hashPassword = await getHash(password)
  const user = await new User({
    email,
    username,
    password: hashPassword
  }).save()

  return _.pick(user, ['email', 'username'])
}

export const login = async (_: T.Parent, { data }: T.Args) => {
  const { username, password } = data

  const user: any = await User.findOne({ username })
  if (!user) throw new Error('invalid username')

  const isMatch = await bcrypt.compare(password, user.password)
  const [accessToken, refreshToken] = await createTokens(user)

  if (isMatch) {
    return {
      accessToken,
      refreshToken,
      message: 'User login successfully.'
    }
  }
  throw new Error('invalid password.')
}
