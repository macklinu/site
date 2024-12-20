import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'
import { parseISO } from 'date-fns'

export const collections = {
  posts: defineCollection({
    type: 'content_layer',
    loader: glob({
      pattern: '**/*.md',
      base: 'src/data/posts',
    }),
    schema: z.object({
      title: z.string(),
      description: z.string(),
      date: z
        .string()
        .date()
        .transform((s) => parseISO(s)),
    }),
  }),
}
