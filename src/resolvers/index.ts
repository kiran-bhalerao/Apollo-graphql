import {
  createPost,
  deleteAllPosts,
  deletePost,
  deleteUser,
  forgatePassword,
  login,
  signup,
  updatePost,
  updateUser
} from './mutations'
import { posts, users } from './query'
import { post } from './subscription'

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    posts,
    users
  },
  Mutation: {
    createPost,
    updatePost,
    deletePost,
    deleteAllPosts,
    signup,
    updateUser,
    deleteUser,
    login,
    forgatePassword
  },
  Subscription: {
    post
  }
}

export default resolvers
