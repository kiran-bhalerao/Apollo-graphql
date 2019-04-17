import bcrypt from 'bcryptjs'
import { errorName } from '../config/errors'
import Post from '../models/post'
import User from '../models/user'
import * as T from '../types/resolver'
import getHash from '../utils/getHash'
import { createTokens } from '../utils/getToken'

export const createPost = async (_: T.Parent, { data }: T.Args, { pubsub, user, POST_CREATED }: any) => {
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

export const deleteAllPosts = async (_: T.Parent, args: T.Args, { user }: any) => {
  if (!user) {
    throw new Error(errorName.UNAUTHORIZED)
  }

  await Post.deleteMany({
    'author.id': user._id
  })

  return 'your all posts are deleted'
}

export const addUser = async (_: T.Parent, { data }: T.Args) => {
  const { email, username, password } = data
  const hashPassword = await getHash(password)
  const user = await new User({
    email,
    username,
    password: hashPassword
  })

  return user.save()
}

export const updateUser = async (_: T.Parent, { id, data }: T.Args) =>
  User.findByIdAndUpdate(id, { ...data }, { new: true })

export const deleteUser = async (_: T.Parent, { id }: T.Args) => User.findByIdAndDelete(id)

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
