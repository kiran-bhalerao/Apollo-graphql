import * as T from '../types/resolver'

export const post = {
  subscribe: async (_: T.Parent, args: T.Args, { pubsub, POST_CREATED }: any) => pubsub.asyncIterator([POST_CREATED])
}
