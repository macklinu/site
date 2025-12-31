import type { FilteredResponseQueryOptions } from '@sanity/client'
import { Context, Effect, Layer } from 'effect'
import { UnknownException } from 'effect/Cause'
import { sanityClient } from 'sanity:client'

export class Service extends Context.Tag('@mackie/web/lib/Sanity/Service')<
  Service,
  {
    readonly fetch: (
      query: string,
      params?: Record<string, any> | undefined,
      options?: FilteredResponseQueryOptions
    ) => Effect.Effect<unknown, UnknownException>
  }
>() {
  static readonly layerLive = Layer.sync(Service, () =>
    Service.of({
      fetch: (query, params, options) =>
        Effect.tryPromise({
          try: (signal) => sanityClient.fetch(query, params, { ...options, signal }),
          catch: (error) => new UnknownException(error),
        }).pipe(Effect.withSpan('Sanity.fetch')),
    })
  )
}
