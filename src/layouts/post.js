import * as React from 'react'
import { graphql } from 'gatsby'
import rehypeReact from 'rehype-react'
import { css, cx } from 'emotion'
import Layout from '../components/layout'
import Header from '../components/Header'
import Footer from '../components/Footer'

let renderAst = new rehypeReact({
  createElement: (component, props = {}, children = []) => {
    if (component === 'div') {
      return <React.Fragment {...props}>{children}</React.Fragment>
    }

    return React.createElement(component, props, children)
  },
  components: {
    // TODO support headings
    a: props => <a {...props} className='link underline blue' />,
    blockquote: props => (
      <blockquote {...props} className='ml0 mt0 pl3 bl bw2 b--blue' />
    ),
    p: props => <p {...props} className='measure-wide lh-copy' />,
    pre: props => (
      <pre
        {...props}
        className={cx(
          'pa3 mt4 mb4 bg-light-gray',
          css({
            overflowX: 'auto',
          })
        )}
      />
    ),
  },
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
      <Header />
      <article className='ph4 mw7'>
        <h1 className='f5 f4-ns fw6 black'>{post.frontmatter.title}</h1>
        <time className='f6 fw4 mt0 black-60'>
          {formatDate(post.frontmatter.date)}
        </time>
        {renderAst(post.htmlAst)}
      </article>
      <Footer />
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
