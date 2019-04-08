import css from '@styled-system/css'
import React from 'react'
import styled from 'styled-components'

import NavLink from './nav-link'
import { Box, Flex } from './'

const Container = styled(Box)(
  css({
    width: '100%',
    maxWidth: 1024,
    mx: 'auto',
    p: 4,
    borderRadius: 2,
  })
)

const Nav = () => (
  <Container>
    <Flex as='nav' alignItems='center' justifyContent='space-between'>
      <NavLink fontSize={3} to='/'>
        mackie
      </NavLink>
      <Flex
        flexDirection='row'
        alignItems='center'
        css={css({
          '> *': {
            px: 2,
          },
        })}
      >
        <NavLink fontSize={3} to='/notes'>
          notes
        </NavLink>
      </Flex>
    </Flex>
  </Container>
)

export default Nav
