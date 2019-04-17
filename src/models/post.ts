import * as mongoose from 'mongoose'
import * as T from '../types/post'
import getLocalTime from '../utils/getLocalTime'

const { Schema } = mongoose

const authorSchema = new Schema({
  id: String,
  username: String
})

const postSchema = new Schema({
  title: String,
  description: String,
  author: authorSchema,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

postSchema.pre<T.IPost>('save', function(next) {
  this.createdAt = getLocalTime(this.createdAt)

  next()
})

export default mongoose.model('post', postSchema)
