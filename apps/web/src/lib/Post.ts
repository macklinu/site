import { getCollection, getEntry, render, type RenderResult } from 'astro:content'
import { Context, DateTime, Effect, Layer, Option, Schema } from 'effect'
import type { UnknownException } from 'effect/Cause'
import type { ParseError } from 'effect/ParseResult'

import * as Slug from '~/lib/Slug'

export const PostId = Schema.UUID.pipe(Schema.brand('PostId'))
export type PostId = typeof PostId.Type

export class PostSummary extends Schema.Class<PostSummary>('@mackie/web/PostSummary')({
  createdAt: Schema.propertySignature(Schema.DateTimeUtc).pipe(Schema.fromKey('_createdAt')),
  title: Schema.String,
  slug: Slug.UrlSlug,
  description: Schema.String,
  publicationDate: Schema.DateTimeUtc,
}) {}

const ContentSchema = Schema.declare(
  (input: unknown): input is RenderResult['Content'] => typeof input === 'function',
  { description: 'Astro RenderResult Content' }
)

export class Post extends PostSummary.extend<Post>('@mackie/web/Post')({
  image: Schema.Unknown.pipe(Schema.OptionFromUndefinedOr),
  Content: ContentSchema,
}) {}

export class PostNotFound extends Schema.TaggedError<PostNotFound>(
  '@mackie/web/lib/Post/PostNotFound'
)('@mackie/web/lib/Post/PostNotFound', { slug: Slug.UrlSlug }) {}

export class Service extends Context.Tag('@mackie/web/lib/Post/Service')<
  Service,
  {
    readonly list: () => Effect.Effect<readonly PostSummary[], ParseError | UnknownException>
    readonly getBySlug: (slug: Slug.UrlSlug) => Effect.Effect<Post, PostNotFound | ParseError>
  }
>() {
  static readonly layerAstro = Layer.succeed(
    Service,
    Service.of({
      getBySlug: (slug) =>
        Effect.gen(function* () {
          const post = yield* Effect.tryPromise(() => getEntry('posts', slug)!)
          const { Content } = yield* Effect.tryPromise(() => render(post))
          return Post.make({
            createdAt: DateTime.unsafeNow(),
            description: post.data.description,
            title: post.data.title,
            slug: Slug.UrlSlug.make(post.id),
            publicationDate: DateTime.unsafeMake(post.data.date),
            image: Option.none(),
            Content,
          })
        }).pipe(Effect.catchAll(() => new PostNotFound({ slug }))),
      list: () =>
        Effect.gen(function* () {
          const posts = yield* Effect.tryPromise(() => getCollection('posts'))
          return posts
            .map((post) =>
              PostSummary.make({
                createdAt: DateTime.unsafeNow(),
                description: post.data.description,
                title: post.data.title,
                slug: Slug.UrlSlug.make(post.id),
                publicationDate: DateTime.unsafeMake(post.data.date),
              })
            )
            .sort((a, b) => b.publicationDate.epochMillis - a.publicationDate.epochMillis)
        }),
    })
  )
}
