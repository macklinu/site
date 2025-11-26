import * as Schema from 'effect/Schema'

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
