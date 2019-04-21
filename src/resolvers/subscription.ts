import { POST_CREATED } from '../define/variables'
import * as T from '../types/resolver'

export const post = {
  subscribe: async (_: T.Parent, args: T.Args, { pubsub }: any) => pubsub.asyncIterator([POST_CREATED])
}
