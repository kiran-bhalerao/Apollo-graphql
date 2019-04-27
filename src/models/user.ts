import * as mongoose from 'mongoose'
import validator from 'validator'
import * as T from '../types/user'

const { Schema } = mongoose

const userSchema = new Schema({
  email: String,
  username: String,
  password: String,
  followers: [
    {
      type: Schema.Types.ObjectId,
      ref: 'user'
    }
  ],
  followings: [
    {
      type: Schema.Types.ObjectId,
      ref: 'user'
    }
  ],
  posts: [
    {
      type: Schema.Types.ObjectId,
      ref: 'post'
    }
  ],
  bookmarks: [
    {
      type: Schema.Types.ObjectId,
      ref: 'post'
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
})

userSchema.pre<T.IUser>('save', function(next) {
  if (validator.isEmail(this.email)) {
    return next()
  }

  next(new Error('Email is invalid.'))
})

export default mongoose.model('user', userSchema)
