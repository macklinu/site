import React from 'react'
import { Box, Heading } from 'components'
import Link from './Link'

const Nav = () => (
  <Box as='nav'>
    <Link to='/' css={{ textDecoration: 'none' }}>
      <Heading
        ml={1}
        fontFamily='Comic Sans MS'
        fontSize={64}
        fontWeight='normal'
        color='cyan.7'
      >
        mackie.world
      </Heading>
    </Link>
  </Box>
)

export default Nav
