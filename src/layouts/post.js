import * as React from 'react'
import { graphql } from 'gatsby'
import rehypeReact from 'rehype-react'
import Layout from '../components/layout'
import Nav from '../components/Nav'

import 'typeface-roboto-mono'

const renderAst = new rehypeReact({
  createElement(component, props = {}, children = []) {
    if (component === 'div') {
      return <React.Fragment {...props}>{children}</React.Fragment>
    }

    return React.createElement(component, props, children)
  },
  components: {
    // TODO support headings
    a: A,
    blockquote: Blockquote,
    p: P,
    pre: Pre,
    code: Code,
  },
}).Compiler

function A(props) {
  return <a {...props} className='link underline blue' />
}

function Blockquote(props) {
  return <blockquote {...props} className='ml0 mt0 pl3 bl bw2 b--light-green' />
}

function P(props) {
  return <p {...props} className='lh-copy' />
}

function Pre(props) {
  return (
    <pre
      className='pa3 mt4 mb4 bg-light-gray'
      css={{ overflowX: 'auto' }}
      {...props}
    />
  )
}

function Code(props) {
  return (
    <code
      css={{ fontFamily: '"Roboto Mono", Consolas, monaco, monospace' }}
      {...props}
    />
  )
}

export default function Post(props) {
  let post = props.data.markdownRemark

  return (
    <Layout>
      <Nav />
      <article className='mw7-ns center ph3 pv2'>
        <h2 className='f2 black'>{post.frontmatter.title}</h2>
        <time className='f6 fw4 mt0 black-70'>{post.frontmatter.date}</time>
        {renderAst(post.htmlAst)}
      </article>
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
        date(formatString: "MMM D, Y")
      }
    }
  }
`
