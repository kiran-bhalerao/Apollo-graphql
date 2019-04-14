import Post from '../models/post'
import * as T from '../types/resolver'

export const createPost = async (_: T.Parent, { data }: T.Args) => {
  const { title, description, author } = data
  const post = new Post({
    title,
    description,
    author,
    createdAt: new Date(),
    updatedAt: new Date()
  })

  return post.save()
}

export const updatePost = async (_: T.Parent, { id, data }: T.Args) => {
  const post = await Post.findByIdAndUpdate(id, {
    ...data,
    updatedAt: new Date()
  })

  return post
}

export const deletePost = async (_: T.Parent, { id }: T.Args) => Post.findByIdAndDelete(id)

export const deleteAllPosts = async () => {
  await Post.deleteMany({})

  return 'All posts are deleted'
}
