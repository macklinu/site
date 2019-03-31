const path = require('path')
const slash = require('slash')

const createPages = async ({ graphql, actions: { createPage } }) => {
  const blogPostTemplate = path.resolve('src/layouts/post.js')

  const result = await graphql(
    `
      {
        allMdx {
          edges {
            node {
              id
              fields {
                slug
              }
              fileAbsolutePath
            }
          }
        }
      }
    `
  )

  if (result.errors) {
    throw result.errors
  }

  // Create blog posts pages.
  result.data.allMdx.edges.forEach(edge => {
    createPage({
      path: edge.node.fields.slug, // required
      component: slash(blogPostTemplate),
      context: {
        slug: edge.node.fields.slug,
      },
    })
  })
}

const onCreateNode = ({ node, actions: { createNodeField } }) => {
  if (node.internal.type === 'Mdx') {
    const directoryName = path.basename(path.dirname(node.fileAbsolutePath))
    createNodeField({
      node,
      name: 'slug',
      value: `/posts/${directoryName}`,
    })
  }
}

module.exports = { createPages, onCreateNode }
