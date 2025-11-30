import { Layer, ManagedRuntime } from 'effect'

import * as Author from '~/lib/Author'
import * as Config from '~/lib/Config'
import * as Post from '~/lib/Post'
import * as Project from '~/lib/Project'
import * as Sanity from '~/lib/Sanity'
import * as Tracing from '~/lib/Tracing'

export const Runtime = ManagedRuntime.make(
  Layer.provideMerge(Post.Service.layerSanity, Sanity.Service.layerLive).pipe(
    Layer.provideMerge(
      Author.Service.layerSanity.pipe(Layer.provide(Sanity.Service.layerLive))
    ),
    Layer.provideMerge(Project.Service.layerStatic),
    Layer.provide(
      Tracing.layer.pipe(Layer.provide(Config.EnvironmentConfig.layer))
    )
  )
)
