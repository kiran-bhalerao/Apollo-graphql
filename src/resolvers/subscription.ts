import { POST_CREATED } from '../constants/variables'
import * as T from '../types/resolver'

export const post = {
  subscribe: async (_: T.Parent, args: T.Args, { pubsub }: any) => pubsub.asyncIterator([POST_CREATED])
}
