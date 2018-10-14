import * as React from 'react'
import { css, cx } from 'emotion'
import Twitter from 'react-feather/dist/icons/twitter'
import GitHub from 'react-feather/dist/icons/github'

function IconLink({ href, children }) {
  return (
    <a className="link mid-gray dim pointer mr2" href={href}>
      {children}
    </a>
  )
}

export default function Footer() {
  return (
    <footer className="pa4">
      <IconLink href="https://twitter.com/macklinu">
        <Twitter />
      </IconLink>
      <IconLink href="https://github.com/macklinu">
        <GitHub />
      </IconLink>
    </footer>
  )
}
