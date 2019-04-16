import bcrypt from 'bcryptjs'
import Post from '../models/post'
import User from '../models/user'
import * as T from '../types/resolver'
import getHash from '../utils/getHash'
import { createTokens } from '../utils/getToken'

export const createPost = async (_: T.Parent, { data, user }: T.Args, { pubsub, POST_CREATED }: any) => {
  console.log(user)
  const { title, description, author } = data
  const post = new Post({
    title,
    description,
    author,
    createdAt: new Date(),
    updatedAt: new Date()
  })

  await pubsub.publish(POST_CREATED, { createdPost: post })

  return post.save()
}

export const updatePost = async (_: T.Parent, { id, data }: T.Args) => {
  const post = await Post.findByIdAndUpdate(
    id,
    {
      ...data,
      updatedAt: new Date()
    },
    { new: true }
  )

  return post
}

export const deletePost = async (_: T.Parent, { id }: T.Args) => Post.findByIdAndDelete(id)

export const deleteAllPosts = async () => {
  await Post.deleteMany({})

  return 'All posts are deleted'
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
  const tokens: any = await createTokens(user)

  if (isMatch) {
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      message: 'User login successfully.'
    }
  }
  throw new Error('invalid password.')
}
