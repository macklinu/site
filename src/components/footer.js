import css from '@styled-system/css'
import React from 'react'
import { FiLink } from 'react-icons/fi'
import styled from 'styled-components'

import { Box, Flex } from './'
import NavLink from './nav-link'

const Container = styled(Box)(
  css({
    width: '100%',
    maxWidth: 1024,
    mx: 'auto',
    p: 4,
    borderRadius: 2,
  })
)

const Footer = () => (
  <Container>
    <Flex
      flexDirection='row'
      alignItems='center'
      justifyContent='flex-end'
      css={css({
        '> *': {
          marginRight: 2,
        },
      })}
    >
      <FiLink />
      <NavLink fontSize={3} to='https://github.com/macklinu'>
        github
      </NavLink>
      <Box>|</Box>
      <NavLink fontSize={3} to='https://twitter.com/macklinu'>
        twitter
      </NavLink>
      <Box>|</Box>
      <NavLink fontSize={3} to='https://www.linkedin.com/in/macklinu'>
        linkedin
      </NavLink>
    </Flex>
  </Container>
)

export default Footer
