const componentWithMDXScope = require('gatsby-mdx/component-with-mdx-scope')
const path = require('path')

exports.createPages = ({ graphql, actions }) => {
  return new Promise((resolve, reject) => {
    resolve(
      graphql(
        `
          {
            allMdx {
              edges {
                node {
                  id
                  fields {
                    slug
                  }
                  code {
                    scope
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
        result.data.allMdx.edges.forEach(({ node }) => {
          actions.createPage({
            path: node.fields.slug,
            component: componentWithMDXScope(
              path.resolve('./src/layouts/post.js'),
              node.code.scope,
              __dirname
            ),
            context: {
              id: node.id,
            },
          })
        })
      })
    )
  })
}

exports.onCreateNode = ({ node, getNode, actions }) => {
  if (node.internal.type === 'Mdx') {
    const parent = getNode(node.parent)
    const postSlug = parent.relativePath.replace(parent.ext, '')
    actions.createNodeField({
      name: 'slug',
      node,
      value: `/posts/${postSlug}`,
    })
  }
}
