import * as mongoose from 'mongoose'
import validator from 'validator'
import * as T from '../types/user'

const { Schema } = mongoose

const userSchema = new Schema({
  email: String,
  username: String,
  password: String,
  posts: [
    {
      type: Schema.Types.ObjectId,
      ref: 'post'
    }
  ]
})

userSchema.pre<T.IUser>('save', function(next) {
  if (validator.isEmail(this.email)) {
    return next()
  }

  next(new Error('Email is invalid.'))
})

export default mongoose.model('user', userSchema)
