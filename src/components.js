import * as React from 'react'
import { Link as GatsbyLink } from 'gatsby'
import tw from 'twin.macro'

export const Link = ({
  children,
  to,
  activeClassName,
  partiallyActive,
  ...other
}) => {
  const internal = /^\/(?!\/)/.test(to)

  if (internal) {
    return (
      <GatsbyLink
        to={to}
        activeClassName={activeClassName}
        partiallyActive={partiallyActive}
        {...other}
      >
        {children}
      </GatsbyLink>
    )
  }
  return (
    <a href={to} {...other}>
      {children}
    </a>
  )
}

// prettier-ignore
export const NavLink = tw(Link)`text-lg font-bold hover:underline p-2 transition duration-500 ease-in-out`

export const Container = tw.div`max-w-3xl mx-auto`
