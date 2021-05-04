import * as React from 'react'
import { Link as GatsbyLink } from 'gatsby'
import cx from '@macklinu/cx'

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

export const NavLink = ({ className, children, ...props }) => (
  <Link
    className={cx(
      'text-lg font-bold hover:underline p-2 transition duration-500 ease-in-out',
      className
    )}
    {...props}
  >
    {children}
  </Link>
)

export const Container = ({ children, className, ...props }) => (
  <div className={cx('max-w-3xl mx-auto', className)} {...props}>
    {children}
  </div>
)
