import { Link as GatsbyLink } from 'gatsby'
import React from 'react'

import { Link as StyledLink } from './'

const NavLink = ({ children, to, className, as = 'a', ...props }) => {
  // This assumes that any internal link (intended for Gatsby)
  // will start with exactly one slash, and that anything else is external.
  const internal = /^\/(?!\/)/.test(to)

  return internal ? (
    <StyledLink as={GatsbyLink} to={to} className={className} {...props}>
      {children}
    </StyledLink>
  ) : (
    <StyledLink as={as} href={to} className={className} {...props}>
      {children}
    </StyledLink>
  )
}

export default NavLink
