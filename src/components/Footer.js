import * as React from 'react'

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
      <IconLink href="https://twitter.com/macklinu">🐦 twitter</IconLink>
      <IconLink href="https://github.com/macklinu">💻 github</IconLink>
    </footer>
  )
}
