import * as Schema from 'effect/Schema'

export const SanitySlug = Schema.transform(
  Schema.Struct({
    _type: Schema.Literal('slug'),
    current: Schema.String,
  }),
  Schema.String.pipe(Schema.brand('Slug')),
  {
    strict: true,
    decode: (value) => value.current,
    encode: (value) => ({ _type: 'slug' as const, current: value }),
  }
)

export type SanitySlug = typeof SanitySlug.Type

export const UrlSlug = Schema.String.pipe(Schema.brand('Slug'))
export type UrlSlug = typeof UrlSlug.Type
