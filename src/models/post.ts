import * as mongoose from 'mongoose'
import * as T from '../types/post'
import getLocalTime from '../utils/getLocalTime'
import commentSchema from './comment'

const { Schema } = mongoose

const authorSchema = new Schema({
  authorId: String,
  authorName: String
})

const postSchema = new Schema({
  title: String,
  description: String,
  type: {
    type: String,
    enum: ['story', 'question', 'news'],
    default: 'story'
  },
  likes: {
    type: Number,
    default: 0
  },
  tags: [String],
  comments: [commentSchema],
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
