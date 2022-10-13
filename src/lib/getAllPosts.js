import glob from 'fast-glob'
import * as path from 'path'

async function importPost(postFilename) {
  let { meta, default: component } = await import(
    `../pages/posts/${postFilename}`
  )
  return {
    slug: postFilename.replace(/(\/index)?\.mdx$/, ''),
    ...meta,
    component,
  }
}

export async function getAllPosts() {
  let postFilenames = await glob(['*.mdx', '*/index.mdx'], {
    cwd: path.join(process.cwd(), 'src/pages/posts'),
  })

  let posts = await Promise.all(postFilenames.map(importPost))

  return posts
    .filter((post) => !!post.published)
    .sort((a, z) => new Date(z.date) - new Date(a.date))
}
