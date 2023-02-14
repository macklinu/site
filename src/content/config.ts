import { defineCollection, z } from 'astro:content'

export const collections = {
  posts: defineCollection({
    schema: z.object({
      title: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      published: z.coerce.boolean().optional().default(true),
    }),
  }),
}
