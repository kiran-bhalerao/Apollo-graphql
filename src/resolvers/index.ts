import { createPost, deleteAllPosts, deletePost, updatePost } from './mutations'
import { posts } from './query'

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    posts
  },
  Mutation: {
    createPost,
    updatePost,
    deletePost,
    deleteAllPosts
  }
}

export default resolvers
