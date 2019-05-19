import { errorName } from '../../define/errors'
import { POST_CREATED } from '../../define/variables'
import * as T from '../../types/resolver'
import { withAuth } from '../../utils/withAuth'
import User from '../user/user.model'
import Post from './post.model'

export default {
  Query: {
    posts: () => Post.find()
  },
  Mutation: {
    createPost: withAuth(async (parent: T.Parent, { data }: T.Args, { pubsub, user, redisClient }: any) => {
      const { title, description, type, tags } = data
      const post = new Post({
        title,
        description,
        type,
        tags: [...tags],
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

      const postRedisId = `post@${post._id}`
      redisClient.set(postRedisId, JSON.stringify(post))

      const userRedisId = `usertimeline@${user._id}`
      redisClient.sadd(userRedisId, postRedisId)

      await pubsub.publish(POST_CREATED, { createdPost: post })

      return post.save()
    }),
    updatePost: withAuth(async (parent: T.Parent, { id, data }: T.Args, { user, redisClient }: any) => {
      const hasPost = user.posts.some((post: string) => post.toString() === id)

      if (!hasPost) {
        throw new Error(errorName.INVALID_POST)
      }

      const updatedPost = await Post.findByIdAndUpdate(
        id,
        {
          ...data,
          updatedAt: new Date()
        },
        { new: true }
      )

      // remove old post from redis cache
      const userRedisId = `usertimeline@${user._id}`
      const postRedisId = `post@${id}`
      await redisClient.srem(userRedisId, postRedisId)
      await redisClient.del(postRedisId)

      // add updated post to redis cache
      const updatedPostRedisId = `post@${updatedPost._id}`
      await redisClient.set(updatedPostRedisId, JSON.stringify(updatedPost))
      await redisClient.sadd(userRedisId, updatedPostRedisId)

      return updatedPost
    }),
    deletePost: withAuth(async (parent: T.Parent, { id }: T.Args, { user, redisClient }: any) => {
      const hasPost = user.posts.some((post: string) => post.toString() === id)

      if (!hasPost) {
        throw new Error(errorName.INVALID_POST)
      }

      const remainingPosts = user.posts.filter((post: string) => post.toString() !== id)

      await User.findByIdAndUpdate(user._id, {
        posts: [...remainingPosts]
      })

      // remove post from redis cache
      const userRedisId = `usertimeline@${user._id}`
      const postRedisId = `post@${id}`
      await redisClient.srem(userRedisId, postRedisId)
      await redisClient.del(postRedisId)

      return Post.findByIdAndDelete(id)
    }),
    deleteAllPosts: withAuth(async (parent: T.Parent, _args: T.Args, { user, redisClient }: any) => {
      await Post.deleteMany({
        'author.id': user._id
      })

      const userRedisId = `usertimeline@${user._id}`
      // remove all post's of user from usertimeline
      await redisClient.del(userRedisId)

      //delete users all post from redis
      const userPosts = await redisClient.smembers(userRedisId)
      await Promise.all(userPosts.map((postId: string) => redisClient.del(postId)))

      return 'your all posts are deleted'
    }),
    userTimeline: withAuth(async (parent: T.Parent, _args: T.Args, { user, redisClient }: any) => {
      // get all post's of user from redis cache
      const userRedisId = `usertimeline@${user._id}`
      const userPosts = await redisClient.smembers(userRedisId)
      let posts: any = await Promise.all(userPosts.map((postId: string) => redisClient.get(postId)))
      posts = posts.map((post: string) => JSON.parse(post))

      // sort the posts[] by updated post date
      // think posts are already sorted...

      // posts = posts.sort((a: any, b: any) => {
      //   const secPost: any = new Date(b.updatedAt)
      //   const firstPost: any = new Date(a.updatedAt)

      //   return secPost - firstPost
      // })

      return posts
    }),
    likeDislikePost: withAuth(async (parent: T.Parent, { postId }: T.Args, { user, redisClient }: any) => {
      const hasPost: any = await Post.findById(postId)

      if (!hasPost) {
        throw new Error(errorName.INVALID_POST)
      }

      const alreadyLikedPost = hasPost.likes.users.some((userId: any) => userId.toString() === user._id.toString())

      const likedPost = () =>
        Post.findByIdAndUpdate(
          postId,
          { $inc: { 'likes.count': 1 }, $push: { 'likes.users': user._id } },
          { new: true }
        )

      const disLikedPost = () =>
        Post.findByIdAndUpdate(
          postId,
          { $inc: { 'likes.count': -1 }, $pull: { 'likes.users': user._id } },
          { new: true }
        )

      const updatedPost = await (alreadyLikedPost ? disLikedPost() : likedPost())

      // remove old post from redis cache
      const userRedisId = `usertimeline@${user._id}`
      const postRedisId = `post@${postId}`
      await redisClient.srem(userRedisId, postRedisId)
      await redisClient.del(postRedisId)

      // add updated post to redis cache
      const updatedPostRedisId = `post@${updatedPost._id}`
      await redisClient.set(updatedPostRedisId, JSON.stringify(updatedPost))
      await redisClient.sadd(userRedisId, updatedPostRedisId)

      return updatedPost
    }),

    homeTimeline: withAuth(async (parent: T.Parent, _args: T.Args, { user, redisClient }: any) => {
      const followingRedisId = `following@${user._id}`
      const followings = await redisClient.smembers(followingRedisId)

      let posts: any = await Promise.all(
        followings.map(async (userId: any) => {
          const userRedisId = `usertimeline@${userId}`
          const userPosts = await redisClient.smembers(userRedisId)

          return userPosts
        })
      )

      posts = await Promise.all(
        posts.map(async (postId: any) => {
          let post: any = await redisClient.get(postId)

          return JSON.parse(post)
        })
      )

      // sort the posts[] by updated post date
      return posts
    }),
    commentPost: withAuth(async (parent: T.Parent, { postId, comment }: T.Args, { user, redisClient }: any) => {
      const hasPost = await Post.findById(postId)

      if (!hasPost) {
        throw new Error(errorName.INVALID_POST)
      }

      const updatedPost = await Post.findByIdAndUpdate(
        postId,
        {
          $push: {
            'comments.comment': comment,
            'comments.user.userId': user._id,
            'comments.user.username': user.username
          }
        },
        { new: true }
      )

      // remove old post from redis cache
      const userRedisId = `usertimeline@${user._id}`
      const postRedisId = `post@${postId}`
      await redisClient.srem(userRedisId, postRedisId)
      await redisClient.del(postRedisId)

      // add updated post to redis cache
      const updatedPostRedisId = `post@${updatedPost._id}`
      await redisClient.set(updatedPostRedisId, JSON.stringify(updatedPost))
      await redisClient.sadd(userRedisId, updatedPostRedisId)

      return updatedPost
    }),
    bookmarkPost: withAuth(async (parent: T.Parent, { postId }: T.Args, { user }: any) => {
      const hasPost = await Post.findById(postId)

      if (!hasPost) {
        throw new Error(errorName.INVALID_POST)
      }

      const updateduser = await User.findByIdAndUpdate(user._id, { $push: { bookmarks: postId } }, { new: true })

      return updateduser
    }),
    unBookmarkPost: withAuth(async (parent: T.Parent, { postId }: T.Args, { user }: any) => {
      const hasPost = await Post.findById(postId)

      if (!hasPost) {
        throw new Error(errorName.INVALID_POST)
      }

      const updateduser = await User.findByIdAndUpdate(user._id, { $pop: { bookmarks: postId } }, { new: true })

      return updateduser
    })
  },
  Post: {
    id(post: any) {
      return post._id
    }
  },
  Subscription: {
    post: {
      subscribe: async (_: T.Parent, args: T.Args, { pubsub }: any) => pubsub.asyncIterator([POST_CREATED])
    }
  }
}
