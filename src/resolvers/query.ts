import Post from '../models/post'

export const posts = () => Post.find()
