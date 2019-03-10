import 'typeface-roboto-mono'

import { graphql } from 'gatsby'
import * as React from 'react'
import { FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa'
import rehypeReact from 'rehype-react'

import { A, Blockquote, Code, P, Pre } from '../components'
import Nav from '../components/Nav'
import Layout from '../components/layout'

const Banner = ({ children, variant }) => {
  const icons = {
    info: () => <FaInfoCircle />,
    warning: () => <FaExclamationTriangle />,
  }
  const variants = {
    info: 'bg-lightest-blue dark-blue',
    warning: 'bg-light-yellow black-70',
  }
  return (
    <div
      className={[variants[variant], 'pv4 ph3 br2'].filter(Boolean).join(' ')}
    >
      {(icons[variant] || (() => null))()}
      <span className='ml2'>{children}</span>
    </div>
  )
}

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
    banner: Banner,
  },
}).Compiler

const Post = props => {
  const post = props.data.markdownRemark

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

export default Post

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
