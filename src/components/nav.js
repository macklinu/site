import css from '@styled-system/css'
import React from 'react'

import NavLink from './nav-link'
import { Flex } from './'

const Nav = () => (
  <Flex as='nav' alignItems='center' justifyContent='space-between' p={2}>
    <NavLink to='/'>mackie</NavLink>
    <Flex
      flexDirection='row'
      alignItems='center'
      css={css({
        '> *': {
          px: 2,
        },
      })}
    >
      <NavLink to='https://github.com/macklinu'>github</NavLink>
      <NavLink to='https://twitter.com/macklinu'>twitter</NavLink>
      <NavLink to='https://www.linkedin.com/in/macklinu'>linkedin</NavLink>
    </Flex>
  </Flex>
)

export default Nav
