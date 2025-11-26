import { Layer, ManagedRuntime } from 'effect'

import * as Post from '~/lib/Post'
import * as Sanity from '~/lib/Sanity'

export const Runtime = ManagedRuntime.make(
  Layer.provideMerge(Post.Service.layerSanity, Sanity.Service.layerLive)
)
