import * as Schema from 'effect/Schema'

export const UrlSlug = Schema.String.pipe(Schema.brand('Slug'))
export type UrlSlug = typeof UrlSlug.Type
