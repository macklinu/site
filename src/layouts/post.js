import * as React from 'react'
import { StaticQuery, graphql } from 'gatsby'
import rehypeReact from 'rehype-react'
import Layout from '../components/layout'
import createScope from '@rebass/markdown'

let components = createScope()

let renderAst = new rehypeReact({
  createElement: React.createElement,
  components: { ...components },
}).Compiler

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function Post(props) {
  let post = props.data.markdownRemark

  return (
    <Layout>
      <components.h1>{post.frontmatter.title}</components.h1>
      <components.p as="time" color="grey">
        {formatDate(post.frontmatter.date)}
      </components.p>
      {renderAst(post.htmlAst)}
    </Layout>
  )
}

export const pageQuery = graphql`
  query($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      htmlAst
      fields {
        slug
      }
      frontmatter {
        title
        date
      }
    }
  }
`
