import * as mongoose from 'mongoose'
import * as T from '../types/comment'
import getLocalTime from '../utils/getLocalTime'

const { Schema } = mongoose

const userSchema = new Schema({
  userId: String,
  username: String
})

const commentSchema = new Schema({
  comment: String,
  user: userSchema,
  createdAt: {
    type: Date,
    default: Date.now
  }
})

commentSchema.pre<T.IComment>('save', function(next) {
  this.createdAt = getLocalTime(this.createdAt)

  next()
})

export default commentSchema
