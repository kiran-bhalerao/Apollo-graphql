import bcrypt from 'bcryptjs'
import { errorName } from '../define/errors'
import { POST_CREATED } from '../define/variables'
import Post from '../models/post'
import User from '../models/user'
import * as T from '../types/resolver'
import { getForgatePasswordTamplate } from '../utils/getForgatePasswordTamplate'
import getHash from '../utils/getHash'
import { createTokens } from '../utils/getToken'
import { getUuid } from '../utils/getUuid'
import sendMail from '../utils/sendMail'

export const createPost = async (parent: T.Parent, { data }: T.Args, { pubsub, user }: any) => {
  if (!user) {
    throw new Error(errorName.UNAUTHORIZED)
  }

  const { title, description, type, tags } = data
  const post = new Post({
    title,
    description,
    type,
    tags: [...tags],
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

export const updatePost = async (parent: T.Parent, { id, data }: T.Args, { user }: any) => {
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

export const deletePost = async (parent: T.Parent, { id }: T.Args, { user }: any) => {
  if (!user) {
    throw new Error(errorName.UNAUTHORIZED)
  }

  const hasPost = user.posts.some((post: string) => post.toString() === id)

  if (!hasPost) {
    throw new Error(errorName.INVALID_POST)
  }

  const remainingPosts = user.posts.filter((post: string) => post.toString() !== id)

  await User.findByIdAndUpdate(user._id, {
    posts: [...remainingPosts]
  })

  return Post.findByIdAndDelete(id)
}

export const deleteAllPosts = async (parent: T.Parent, _args: T.Args, { user }: any) => {
  if (!user) {
    throw new Error(errorName.UNAUTHORIZED)
  }

  await Post.deleteMany({
    'author.id': user._id
  })

  return 'your all posts are deleted'
}

export const updateUser = async (parent: T.Parent, { data }: T.Args, { user }: any) => {
  if (!user) {
    throw new Error(errorName.UNAUTHORIZED)
  }

  return User.findByIdAndUpdate(user._id, { ...data }, { new: true })
}

export const deleteUser = async (parent: T.Parent, _args: T.Args, { user }: any) => {
  if (!user) {
    throw new Error(errorName.UNAUTHORIZED)
  }

  await Post.deleteMany({
    'author.id': user._id
  })

  return User.findByIdAndDelete(user._id)
}

export const forgatePassword = async (parent: T.Parent, { email }: T.Args, { redisClient }: any) => {
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

export const signup = async (parent: T.Parent, { data }: T.Args) => {
  const { email, username, password } = data

  const userExist: any = await User.findOne({ email })
  if (userExist) throw new Error('Email already rigistered')

  const hashPassword = await getHash(password)
  const user = await new User({
    email,
    username,
    password: hashPassword,
    createdAt: new Date()
  }).save()

  return `Welcome ${username}, your registration done successfully.`
}

export const login = async (parent: T.Parent, { data }: T.Args) => {
  const { email, password } = data

  const user: any = await User.findOne({ email })
  if (!user) throw new Error('invalid username')

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    throw new Error('invalid password.')
  }
  const [accessToken, refreshToken] = await createTokens(user)

  return {
    accessToken,
    refreshToken,
    message: 'User login successfully.'
  }
}

export const likePost = async (parent: T.Parent, { postId }: T.Args, { user }: any) => {
  if (!user) {
    throw new Error(errorName.UNAUTHORIZED)
  }

  const hasPost = await Post.findById(postId)

  if (!hasPost) {
    throw new Error(errorName.INVALID_POST)
  }

  return Post.findByIdAndUpdate(postId, { $inc: { likes: 1 } }, { new: true })
}

export const commentPost = async (parent: T.Parent, { postId, comment }: T.Args, { user }: any) => {
  if (!user) {
    throw new Error(errorName.UNAUTHORIZED)
  }

  const hasPost = await Post.findById(postId)

  if (!hasPost) {
    throw new Error(errorName.INVALID_POST)
  }

  return Post.findByIdAndUpdate(
    postId,
    {
      $push: { 'comments.comment': comment, 'comments.user.userId': user._id, 'comments.user.username': user.username }
    },
    { new: true }
  )
}
