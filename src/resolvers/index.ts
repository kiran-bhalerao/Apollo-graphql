import {
  bookmarkPost,
  createPost,
  deleteAllPosts,
  deletePost,
  deleteUser,
  followUser,
  forgatePassword,
  homeTimeline,
  likeDislikePost,
  login,
  signup,
  unBookmarkPost,
  updatePost,
  updateUser,
  userTimeline
} from './mutations'
import { posts, user, users } from './query'
import { post } from './subscription'

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    posts,
    users,
    user
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
    userTimeline,
    likeDislikePost,
    followUser,
    homeTimeline,
    bookmarkPost,
    unBookmarkPost
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
