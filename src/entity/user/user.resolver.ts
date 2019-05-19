import bcrypt from 'bcryptjs'
import Post from '../../entity/post/post.model'
import * as T from '../../types/resolver'
import { getForgatePasswordTamplate } from '../../utils/getForgatePasswordTamplate'
import getHash from '../../utils/getHash'
import { createTokens } from '../../utils/getToken'
import { getUuid } from '../../utils/getUuid'
import sendMail from '../../utils/sendMail'
import { withAuth } from '../../utils/withAuth'
import User from './user.model'

export default {
  Query: {
    users: () => User.find(),
    user: withAuth((parent: T.Parent, _args: T.Args, { user }: any) => User.findById(user._id))
  },
  Mutation: {
    signup: async (parent: T.Parent, { data }: T.Args) => {
      const { email, username, password } = data

      const userExist: any = await User.findOne({ email })
      if (userExist) throw new Error('Email already rigistered')

      const hashPassword = await getHash(password)
      await new User({
        email,
        username,
        password: hashPassword,
        createdAt: new Date()
      }).save()

      return `Welcome ${username}, your registration done successfully.`
    },
    updateUser: withAuth(async (parent: T.Parent, { data }: T.Args, { user }: any) => {
      return User.findByIdAndUpdate(user._id, { ...data }, { new: true })
    }),
    deleteUser: withAuth(async (parent: T.Parent, _args: T.Args, { user }: any) => {
      await Post.deleteMany({
        'author.authorId': user._id
      })

      // clean up users all post from redis

      return User.findByIdAndDelete(user._id)
    }),
    login: async (parent: T.Parent, { data }: T.Args) => {
      const { email, password } = data

      const user: any = await User.findOne({ email })
      if (!user) throw new Error('invalid email')

      const isMatch = await bcrypt.compare(password, user.password)
      if (!isMatch) {
        throw new Error('invalid password.')
      }
      const [accessToken, refreshToken] = await createTokens(user)

      return {
        accessToken,
        refreshToken,
        message: 'User login successfully.'
      }
    },
    forgatePassword: async (parent: T.Parent, { email }: T.Args, { redisClient }: any) => {
      const user: any = await User.findOne({ email })
      const key = getUuid()
      const uid = user._id.toString()
      await redisClient.set(key, uid, 'EX', 1800)

      const link = `${process.env.BASE_URL}/forgate/password/${key}`
      const subject = 'Forgate Password'
      const template = getForgatePasswordTamplate(link, user.username)

      sendMail(email, subject, template)

      return 'Check your mail and recreate your password.'
    },
    unFollowUser: withAuth(async (parent: T.Parent, { followingId }: T.Args, { user, redisClient }: any) => {
      const followingUser: any = await User.findById(followingId)

      if (!followingUser) {
        // tslint:disable-next-line: prettier
        return new Error('You can\'t unfollow the user which is not exists.')
      }

      const isFollowing = followingUser.followings.some((id: any) => id.toString() === followingId)
      if (!isFollowing) {
        // tslint:disable-next-line: prettier
        return new Error('You can\'t unfollow the user which you are not following.')
      }

      await User.findByIdAndUpdate(followingId, {
        $pull: { followers: user._id }
      })

      const followingRedisId = `following@${user._id}`
      await redisClient.srem(followingRedisId, followingId)

      return User.findByIdAndUpdate(
        user._id,
        {
          $pull: { followings: followingId }
        },
        { new: true }
      )
    }),
    followUser: withAuth(async (parent: T.Parent, { followingId }: T.Args, { user, redisClient }: any) => {
      const followingUser: any = await User.findById(followingId)

      if (!followingUser) {
        return new Error('You can not follow unexist user.')
      }

      const isFollowing = followingUser.followings.some((id: any) => id.toString() === followingId)
      if (isFollowing) {
        // tslint:disable-next-line: prettier
        return new Error('You already follows that user.')
      }

      const followingRedisId = `following@${user._id}`
      await redisClient.sadd(followingRedisId, followingId)

      // add userID to following users followers array
      await User.findByIdAndUpdate(followingId, {
        $push: { followers: user._id }
      })

      // add followingid to current users followings array
      return User.findByIdAndUpdate(
        user._id,
        {
          $push: { followings: followingId }
        },
        { new: true }
      )
    })
  }
}
