import { Context, Effect, Layer, Schema } from 'effect'

export class Project extends Schema.Class<Project>('@mackie/web/Project')({
  name: Schema.String,
  href: Schema.String,
  description: Schema.String,
}) {}

export class Service extends Context.Tag('@mackie/web/lib/Project/Service')<
  Service,
  {
    list: () => Effect.Effect<readonly Project[]>
  }
>() {
  static readonly layerStatic = Layer.succeed(Service, {
    list: () =>
      Effect.succeed([
        {
          name: 'repo.vercel.app',
          href: 'https://repo.vercel.app',
          description: 'Find the repo for any npm package',
        },
        {
          name: 'fthrsn',
          href: 'https://fthrsn.bandcamp.com',
          description: 'Music project from 2011-2013',
        },
      ]).pipe(Effect.withSpan('Project.Service.list')),
  })
}
