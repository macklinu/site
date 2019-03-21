import 'typeface-roboto-mono'

import { graphql } from 'gatsby'
import React from 'react'
import { FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa'
import rehypeReact from 'rehype-react'

import Layout from '../components/Layout'
import Nav from '../components/Nav'

const A = props => <a {...props} className='link underline blue' />

const Blockquote = props => (
  <blockquote {...props} className='ml0 mt0 pl3 bl bw2 b--moon-gray' />
)

const P = props => <p {...props} className='lh-copy' />

const Pre = props => <pre css={{ overflowX: 'auto' }} {...props} />

const Code = props => (
  <code
    css={{ fontFamily: '"Roboto Mono", Consolas, monaco, monospace' }}
    {...props}
  />
)

const Banner = ({ children, variant }) => {
  const icons = {
    info: FaInfoCircle,
    warning: FaExclamationTriangle,
  }
  const variants = {
    info: 'bg-lightest-blue dark-blue',
    warning: 'bg-light-yellow black-70',
  }
  return (
    <div
      className={[variants[variant], 'pv4 ph3 br2'].filter(Boolean).join(' ')}
    >
      {React.createElement(icons[variant])}
      <span className='ml2'>{children}</span>
    </div>
  )
}

/**
 * Duplicates an object, omitting specified property names.
 *
 * @param {*} obj The object to copy.
 * @param {string[]} properties A list of properties to omit.
 */
const omit = (obj, properties) => {
  const omittedProperties = new Set(properties)
  return Object.keys(obj).reduce((newObj, key) => {
    if (omittedProperties.has(key)) {
      return newObj
    }
    return { ...newObj, [key]: obj[key] }
  }, {})
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
    img: props => (
      <img
        css={{ display: 'block', margin: '0 auto' }}
        {...omit(props, ['children'])}
      />
    ),
  },
}).Compiler

const Post = props => {
  const post = props.data.markdownRemark

  return (
    <Layout meta={{ title: post.frontmatter.title, description: post.excerpt }}>
      <Nav />
      <article className='mw7-ns center ph3 pv2'>
        <h2 className='f2'>{post.frontmatter.title}</h2>
        <span className='f6 fw4 mt0 black-70'>
          {post.frontmatter.date} • {post.timeToRead} min read
        </span>
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
        date(formatString: "MMMM DD, Y")
      }
      timeToRead
      excerpt
    }
  }
`
