import * as React from 'react'
import { Link } from 'gatsby'
import mackie from '../images/mackie.jpg'

export default function Header() {
  return (
    <header className="pa4">
      <Link to="/" className="link dib">
        <img src={mackie} class="br-100 ba b--black-10 h3 w3" alt="avatar" />
        <h1 class="f5 f4-ns fw6 black">mackie</h1>
        <h2 class="f6 gray fw2">engineer, musician, artist</h2>
      </Link>
    </header>
  )
}
