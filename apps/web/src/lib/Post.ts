import { Context, Effect, Layer, Schema } from 'effect'
import type { UnknownException } from 'effect/Cause'
import type { ParseError } from 'effect/ParseResult'
import groq from 'groq'

import * as Sanity from '~/lib/Sanity'
import * as Slug from '~/lib/Slug'

export const Block = Schema.Struct({
  _key: Schema.String,
  _type: Schema.Literal('block'),
  children: Schema.Array(Schema.Unknown),
  markDefs: Schema.Array(Schema.Unknown),
  style: Schema.String,
})

export const Code = Schema.Struct({
  _key: Schema.String,
  _type: Schema.Literal('code'),
  code: Schema.String,
  language: Schema.String.pipe(Schema.optional),
  filename: Schema.String.pipe(Schema.optional),
})

export const Image = Schema.Struct({
  _key: Schema.String,
  _type: Schema.Literal('image'),
  asset: Schema.Unknown,
})

export const PostId = Schema.UUID.pipe(Schema.brand('PostId'))
export type PostId = typeof PostId.Type

export class PostSummary extends Schema.Class<PostSummary>(
  '@mackie/web/PostSummary'
)({
  id: Schema.propertySignature(PostId).pipe(Schema.fromKey('_id')),
  createdAt: Schema.propertySignature(Schema.DateTimeUtc).pipe(
    Schema.fromKey('_createdAt')
  ),
  title: Schema.String,
  slug: Slug.SanitySlug,
  description: Schema.String,
  publicationDate: Schema.DateTimeUtc,
}) {}

export class Post extends PostSummary.extend<Post>('@mackie/web/Post')({
  image: Schema.Unknown.pipe(Schema.OptionFromUndefinedOr),
  body: Schema.Array(Schema.Union(Block, Code, Image)).pipe(Schema.mutable),
}) {}

export class PostNotFound extends Schema.TaggedError<PostNotFound>(
  '@mackie/web/lib/Post/PostNotFound'
)('@mackie/web/lib/Post/PostNotFound', { slug: Slug.SanitySlug }) {}

export class Service extends Context.Tag('@mackie/web/lib/Post/Service')<
  Service,
  {
    readonly list: () => Effect.Effect<
      readonly PostSummary[],
      ParseError | UnknownException
    >
    readonly getBySlug: (
      slug: Slug.UrlSlug
    ) => Effect.Effect<Post, PostNotFound | ParseError>
  }
>() {
  static readonly layerSanity = Layer.effect(
    Service,
    Effect.gen(function* () {
      const sanity = yield* Sanity.Service

      const getBySlug = Effect.fn('Post.Service.getBySlug')(
        function* (slug: Slug.UrlSlug) {
          const result = yield* sanity.fetch(
            groq`*[_type == "post" && slug.current == $slug][0] { ..., author-> { ..., 'image': image.asset->url  } }`,
            { slug }
          )

          return yield* Schema.decodeUnknown(Post)(result)
        },
        (effect, slug) =>
          Effect.catchAll(effect, () => new PostNotFound({ slug }))
      )

      const list = Effect.fn('Post.Service.list')(function* () {
        const result = yield* sanity.fetch(
          groq`*[_type == "post"] {
            _id,
            _createdAt,
            title,
            slug,
            description,
            publicationDate
          } | order(publicationDate desc)`
        )

        return yield* Schema.decodeUnknown(Schema.Array(PostSummary))(result)
      })

      return Service.of({
        getBySlug,
        list,
      })
    })
  )
}
