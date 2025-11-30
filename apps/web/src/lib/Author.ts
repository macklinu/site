import { Context, Effect, Layer } from 'effect'
import type { UnknownException } from 'effect/Cause'
import type { ParseError } from 'effect/ParseResult'
import * as Schema from 'effect/Schema'
import groq from 'groq'

import * as Sanity from '~/lib/Sanity'
import * as Slug from '~/lib/Slug'

export const AuthorId = Schema.UUID.pipe(Schema.brand('AuthorId'))
export type AuthorId = typeof AuthorId.Type

export class Author extends Schema.Class<Author>('@mackie/web/Author')({
  id: Schema.propertySignature(AuthorId).pipe(Schema.fromKey('_id')),
  createdAt: Schema.propertySignature(Schema.DateTimeUtc).pipe(
    Schema.fromKey('_createdAt')
  ),
  name: Schema.String,
  slug: Slug.SanitySlug,
  bio: Schema.String,
  twitterHandle: Schema.String,
  githubHandle: Schema.String,
  image: Schema.URL,
}) {}

export class Service extends Context.Tag('@mackie/web/lib/Author/Service')<
  Service,
  {
    me: () => Effect.Effect<Author, UnknownException | ParseError>
  }
>() {
  static readonly layerSanity = Layer.effect(
    Service,
    Effect.gen(function* () {
      const sanityService = yield* Sanity.Service

      const me = Effect.fn('Author.Service.me')(function* () {
        const result = yield* sanityService.fetch(
          groq`*[_type == "author"][0]{..., "image": image.asset->url}`
        )

        return yield* Schema.decodeUnknown(Author)(result)
      })

      return Service.of({
        me,
      })
    })
  )
}
