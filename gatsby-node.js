const path = require('path')
const slash = require('slash')

const createPages = async ({ graphql, actions: { createPage } }) => {
  const blogPostTemplate = path.resolve('src/layouts/post.js')

  const result = await graphql(
    `
      {
        allMarkdownRemark(
          filter: { frontmatter: { date: { ne: null } } }
          sort: { fields: [frontmatter___date], order: DESC }
        ) {
          edges {
            node {
              fields {
                slug
              }
              frontmatter {
                title
                date(formatString: "MMMM D, Y")
                tags
              }
              timeToRead
              excerpt
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
  result.data.allMarkdownRemark.edges.forEach(edge => {
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
  if (node.internal.type === 'MarkdownRemark') {
    const directoryName = path.basename(path.dirname(node.fileAbsolutePath))
    createNodeField({
      node,
      name: 'slug',
      value: `posts/${directoryName}`,
    })
  }
}

module.exports = { createPages, onCreateNode }
