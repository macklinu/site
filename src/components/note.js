import css from '@styled-system/css'
import React from 'react'
import rehypeReact from 'rehype-react'
import styled from 'styled-components'

import { Box, Heading, Text } from '../components'
import Layout from '../components/layout'
import NavLink from '../components/nav-link'

const A = props => <NavLink {...props} />

const Blockquote = props => (
  <Box
    as='blockquote'
    css={css({
      marginLeft: 0,
      // todo figure out how to use a theme color name instead of a hex color code
      borderLeft: '2px solid #525EDC',
      paddingLeft: 2,
    })}
    {...props}
  />
)

const P = props => (
  <Text as='p' fontSize={[2, 3]} lineHeight={1.625} {...props} />
)

const Pre = props => (
  <Text
    fontSize={[2, 3]}
    as='pre'
    p={2}
    color='text'
    border='solid 1px #525EDC'
    borderRadius={2}
    css={{ overflowX: 'auto' }}
    {...props}
  />
)

const Code = props => (
  <Text fontSize={[2, 3]} color='text' as='code' fontFamily='mono' {...props} />
)

const Banner = ({ children }) => (
  <Box backgroundColor='tertiary' borderRadius={2}>
    <P p={2}>{children}</P>
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
  createElement(component, props = {}, children = []) {
    if (component === 'div') {
      return <React.Fragment {...props}>{children}</React.Fragment>
    }
    return React.createElement(component, props, children)
  },
  components: {
    h1: props => <Heading as='h1' my={[3, 4]} fontSize={[5, 6]} {...props} />,
    h2: props => <Heading as='h2' my={[3, 4]} fontSize={[4, 5]} {...props} />,
    h3: props => <Heading as='h3' my={[3, 4]} fontSize={3} {...props} />,
    h4: props => <Heading as='h4' my={[3, 4]} fontSize={2} {...props} />,
    h5: props => <Heading as='h5' my={[3, 4]} fontSize={1} {...props} />,
    h6: props => <Heading as='h6' my={[3, 4]} fontSize={0} {...props} />,
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
        css={{
          display: 'block',
          margin: '0 auto',
          maxWidth: '100%',
        }}
        {...omit(props, ['children'])}
      />
    ),
    br: props => <br {...omit(props, ['children'])} />,
  },
}).Compiler

const Note = ({ pageContext: { htmlAst } }) => (
  <Layout>
    <Box as='article'>{renderAst(htmlAst)}</Box>
  </Layout>
)

export default Note
