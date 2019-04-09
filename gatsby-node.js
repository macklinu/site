const path = require('path')
const slash = require('slash')

const createPages = async ({ graphql, actions: { createPage } }) => {
  const getPosts = () =>
    graphql(`
      {
        allMarkdownRemark(
          filter: {
            frontmatter: { date: { ne: null } }
            fields: { collection: { eq: "posts" } }
          }
          sort: { fields: [frontmatter___date], order: DESC }
        ) {
          nodes {
            fields {
              slug
            }
          }
        }
      }
    `).then(result => {
      if (result.errors) {
        throw result.errors
      }
      return result
    })
  const getNotes = () =>
    graphql(`
      {
        allMarkdownRemark(filter: { fields: { collection: { eq: "notes" } } }) {
          edges {
            node {
              htmlAst
              parent {
                ... on File {
                  name
                  base
                  relativePath
                  relativeDirectory
                }
              }
            }
          }
        }
      }
    `).then(result => {
      if (result.errors) {
        throw result.errors
      }
      return result
    })
  const Post = require.resolve('./src/layouts/post.js')
  const Note = require.resolve('./src/components/note.js')
  const Notes = require.resolve('./src/components/notes.js')

  const [posts, notes] = await Promise.all([getPosts(), getNotes()])

  const groupedNotes = {}

  notes.data.allMarkdownRemark.edges.forEach(({ node }) => {
    const { name, relativeDirectory } = node.parent
    const slug = path.join('notes', relativeDirectory, name)

    if (!groupedNotes[relativeDirectory]) {
      groupedNotes[relativeDirectory] = []
    }
    groupedNotes[relativeDirectory].push({ name, slug })

    createPage({
      path: `/${slug}`,
      component: slash(Note),
      context: { ...node, slug },
    })
  })

  Object.keys(groupedNotes).forEach(key => {
    groupedNotes[key].sort()
  })

  createPage({
    path: '/notes',
    component: slash(Notes),
    context: { groupedNotes },
  })

  posts.data.allMarkdownRemark.nodes.forEach(({ fields: { slug } }) => {
    createPage({
      path: slug,
      component: slash(Post),
      context: { slug },
    })
  })
}

const onCreateNode = ({ node, actions: { createNodeField }, getNode }) => {
  if (node.internal.type === 'MarkdownRemark') {
    const parent = getNode(node.parent)
    createNodeField({
      node,
      name: 'collection',
      value: parent.sourceInstanceName,
    })

    const directoryName = path.basename(path.dirname(node.fileAbsolutePath))
    createNodeField({
      node,
      name: 'slug',
      value: `posts/${directoryName}`,
    })
  }
}

module.exports = { createPages, onCreateNode }
