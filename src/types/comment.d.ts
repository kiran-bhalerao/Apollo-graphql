import * as mongoose from 'mongoose'
export interface IComment extends mongoose.Document {
  comment: string
  user: any
  createdAt: Date
}
