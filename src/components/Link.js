import React from 'react'
import { Link as GatsbyLink } from 'gatsby'

export default function Link({
  children,
  to,
  className = 'link br2 dark-gray bg-animate hover-bg-lightest-blue pa3',
  ...props
}) {
  // This assumes that any internal link (intended for Gatsby)
  // will start with exactly one slash, and that anything else is external.
  let internal = /^\/(?!\/)/.test(to)

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
