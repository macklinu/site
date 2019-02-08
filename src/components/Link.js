import React from 'react'
import { Link as GatsbyLink } from 'gatsby'

const Link = ({ children, to, className, ...props }) => {
  // This assumes that any internal link (intended for Gatsby)
  // will start with exactly one slash, and that anything else is external.
  const internal = /^\/(?!\/)/.test(to)

  return internal ? (
    <GatsbyLink to={to} className={className} {...props}>
      {children}
    </GatsbyLink>
  ) : (
    <a href={to} className={className} {...props}>
      {children}
    </a>
  )
}

export default Link
