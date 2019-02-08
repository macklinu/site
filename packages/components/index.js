import React from 'react'
import { ThemeProvider } from 'styled-components'
import { Text, Heading, Image, Box, Flex, Card } from 'rebass'
import theme from './theme'

const Provider = ({ children }) => (
  <ThemeProvider theme={theme}>
    <Text fontFamily='sans'>{children}</Text>
  </ThemeProvider>
)

const A = props => <a {...props} className='link underline blue' />

const Blockquote = props => (
  <blockquote {...props} className='ml0 mt0 pl3 bl bw2 b--light-blue' />
)

const P = props => <p {...props} className='lh-copy f4' />

const Pre = props => (
  <pre
    className='pa3 mt4 mb4 bg-dark-gray near-white'
    css={{ overflowX: 'auto' }}
    {...props}
  />
)

const Code = props => (
  <code
    css={{ fontFamily: '"Roboto Mono", Consolas, monaco, monospace' }}
    {...props}
  />
)

export {
  A,
  Blockquote,
  P,
  Pre,
  Code,
  Provider,
  Heading,
  Flex,
  Box,
  Image,
  Text,
  Card,
  theme,
}
