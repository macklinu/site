import { Context, Effect, Layer } from 'effect'
import type { UnknownException } from 'effect/Cause'
import type { ParseError } from 'effect/ParseResult'
import * as Schema from 'effect/Schema'

import silly from '~/content/silly.png'
import * as Slug from '~/lib/Slug'

export const AuthorId = Schema.UUID.pipe(Schema.brand('AuthorId'))
export type AuthorId = typeof AuthorId.Type

const ImageMetadata = Schema.declare(
  (input: unknown): input is ImageMetadata =>
    typeof input === 'object' && input !== null && 'src' in input,
  {
    description: 'Astro ImageMetadata',
  }
)

export class Author extends Schema.Class<Author>('@mackie/web/Author')({
  name: Schema.String,
  slug: Slug.UrlSlug,
  bio: Schema.String,
  twitterHandle: Schema.String,
  githubHandle: Schema.String,
  image: ImageMetadata,
}) {}

export class Service extends Context.Tag('@mackie/web/lib/Author/Service')<
  Service,
  {
    me: () => Effect.Effect<Author, UnknownException | ParseError>
  }
>() {
  static readonly layerStatic = Layer.succeed(
    Service,
    Service.of({
      me: () =>
        Effect.succeed(
          Author.make({
            name: 'Mackie Underdown',
            githubHandle: '@macklinu',
            twitterHandle: '@macklinu',
            slug: Slug.UrlSlug.make('mackie-underdown'),
            bio: 'Detroit-based software engineer and musician',
            image: silly,
          })
        ),
    })
  )
}
