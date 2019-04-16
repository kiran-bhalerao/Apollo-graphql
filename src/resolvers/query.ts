import Post from '../models/post'
import User from '../models/user'

export const posts = () => Post.find()

export const users = () => User.find()
