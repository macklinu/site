import { defineCollection, z } from 'astro:content'
import { DateTime } from 'luxon'

export const collections = {
  posts: defineCollection({
    type: 'content',
    schema: z.object({
      title: z.string(),
      description: z.string(),
      date: z.string().transform((s) => DateTime.fromISO(s).toJSDate()),
    }),
  }),
}
