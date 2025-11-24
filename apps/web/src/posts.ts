import { type CollectionEntry, getCollection } from 'astro:content'

export type Post = CollectionEntry<'posts'>

export async function getPosts() {
  const posts = await getCollection('posts')

  return posts.sort(
    (a, b) =>
      b.data.date.getTime() - a.data.date.getTime() ||
      a.data.title.localeCompare(b.data.title)
  )
}
