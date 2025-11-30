import { defineField, defineType } from 'sanity'

const item = defineType({
  name: 'item',
  title: 'Item',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      options: {
        source: 'title',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'url',
      type: 'url',
      title: 'URL',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'coverImage',
      type: 'image',
      title: 'Cover Image',
    }),
    defineField({
      name: 'description',
      type: 'string',
      title: 'Description',
    }),
  ],
})

const list = defineType({
  name: 'list',
  title: 'List',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'items',
      title: 'Items',
      type: 'reference',
      validation: (rule) => rule.required(),
      to: [{ type: 'item' }],
    }),
  ],
})

const author = defineType({
  name: 'author',
  title: 'Author',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      validation: (rule) => rule.required(),
      options: {
        source: 'name',
      },
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'text',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'twitterHandle',
      title: 'Twitter Handle',
      type: 'string',
      validation: (rule) => rule.required().regex(/^@\w+$/i),
    }),
    defineField({
      name: 'githubHandle',
      title: 'GitHub Handle',
      type: 'string',
      validation: (rule) => rule.required().regex(/^@\w+$/i),
    }),
  ],
})

const post = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  initialValue: async (_params, context) => {
    const client = context.getClient({ apiVersion: '2025-11-24' })
    const author = await client.fetch(`*[_type == "author"][0]`)
    return author
      ? {
          author: {
            _type: 'reference',
            _ref: author._id,
          },
        }
      : (undefined as any)
  },
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      validation: (rule) => rule.required(),
      options: {
        source: 'title',
      },
    }),
    defineField({
      name: 'description',
      title: 'Description',
      description: 'A brief description used for SEO and short blurbs',
      type: 'text',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'publicationDate',
      title: 'Publication Date',
      type: 'date',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'author' }],
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        {
          type: 'block',
        },
        {
          type: 'image',
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative text',
              description: 'Important for SEO and accessibility',
            },
          ],
        },
        {
          type: 'code',
          options: {
            withFilename: true,
          },
        },
      ],
    }),
  ],
})

export const schemaTypes = [item, list, author, post]
