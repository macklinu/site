const path = require('path')
const slash = require('slash')

exports.createPages = ({ graphql, actions: { createPage } }) => {
  const blogPostTemplate = path.resolve('src/layouts/post.js')

  return new Promise((resolve, reject) => {
    graphql(
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
                  date
                }
              }
            }
          }
        }
      `
    ).then(result => {
      if (result.errors) {
        reject(result.errors)
        return
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

      resolve()
    })
  })
}

exports.onCreateNode = ({ node, actions: { createNodeField }, getNode }) => {
  if (node.internal.type === 'File') {
    const { name } = path.parse(node.absolutePath)
    const slug = `/posts/${name}`
    createNodeField({ node, name: 'slug', value: slug })
  } else if (
    node.internal.type === 'MarkdownRemark' &&
    typeof node.slug === 'undefined'
  ) {
    const fileNode = getNode(node.parent)
    createNodeField({
      node,
      name: 'slug',
      value: fileNode.fields.slug,
    })
  }
}
