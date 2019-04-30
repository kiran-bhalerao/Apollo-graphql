import {
  createPost,
  deleteAllPosts,
  deletePost,
  deleteUser,
  forgatePassword,
  login,
  signup,
  updatePost,
  updateUser,
  userTimeline
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
    forgatePassword,
    userTimeline
  },
  Post: {
    id(post: any) {
      return post._id
    }
  },
  Subscription: {
    post
  }
}

export default resolvers
