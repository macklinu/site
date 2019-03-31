import 'typeface-roboto-mono'

import css from '@styled-system/css'
import { graphql } from 'gatsby'
import React from 'react'
import rehypeReact from 'rehype-react'
import styled from 'styled-components'

import { Box, Heading, Text } from '../components'
import Layout from '../components/layout'
import NavLink from '../components/nav-link'

const A = props => <NavLink {...props} />

const Blockquote = props => (
  <Text
    as='blockquote'
    {...props}
    css={css({
      marginLeft: 0,
      borderLeft: '2px solid black',
      paddingLeft: 3,
    })}
  />
)

const P = props => (
  <Text as='p' fontSize={[2, 3]} lineHeight={1.625} {...props} />
)

const Pre = props => (
  <Text
    fontSize={[2, 3]}
    as='pre'
    backgroundColor='code'
    px={2}
    color='text'
    css={{ overflowX: 'auto' }}
    {...props}
  />
)

const Code = props => (
  <Text fontSize={[2, 3]} color='text' as='code' fontFamily='mono' {...props} />
)

const Banner = ({ children }) => (
  <Box backgroundColor='tertiary' py={3} px={3} borderRadius={2}>
    <Text>{children}</Text>
  </Box>
)

const List = styled('ul')({
  listStyle: 'none',
  paddingLeft: 0,
})

const ListItem = styled('li')(
  css({
    py: 1,
    fontSize: 3,
    lineHeight: 1.25,
  }),
  css({
    '&::before': {
      content: '"-"',
      paddingRight: 2,
    },
  })
)

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
  createElement: React.createElement,
  components: {
    h1: props => <Heading as='h1' my={4} fontSize={[5, 6]} {...props} />,
    h2: props => <Heading as='h2' my={4} fontSize={[4, 5]} {...props} />,
    h3: props => <Heading as='h3' my={4} fontSize={3} {...props} />,
    h4: props => <Heading as='h4' my={4} fontSize={2} {...props} />,
    h5: props => <Heading as='h5' my={4} fontSize={1} {...props} />,
    h6: props => <Heading as='h6' my={4} fontSize={0} {...props} />,
    blockquote: Blockquote,
    p: P,
    a: A,
    pre: Pre,
    code: Code,
    banner: Banner,
    ul: List,
    li: ListItem,
    img: props => (
      <Box
        as='img'
        py={2}
        css={{ display: 'block', margin: '0 auto' }}
        {...omit(props, ['children'])}
      />
    ),
  },
}).Compiler

const Post = props => {
  const post = props.data.markdownRemark

  return (
    <Layout
      meta={{
        title: post.frontmatter.title,
        description: post.excerpt,
      }}
    >
      <>
        <Box as='header' py={2}>
          <Heading fontSize={[4, 5]} lineHeight={1.25}>
            {post.frontmatter.title}
          </Heading>
          <Text as='span' fontFamily='mono' fontSize={2} lineHeight={1.5}>
            {post.frontmatter.date}
          </Text>
        </Box>
        <Box as='article'>{renderAst(post.htmlAst)}</Box>
      </>
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
