import { addUser, createPost, deleteAllPosts, deletePost, deleteUser, login, updatePost, updateUser } from './mutations'
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
    addUser,
    updateUser,
    deleteUser,
    login
  },
  Subscription: {
    post
  }
}

export default resolvers
