import React from 'react'
import { FaGhost, FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa'

import Link from './Link'

const Nav = () => (
  <nav className='bb b--black-20'>
    <div className='mw7-ns center pv2-ns flex items-center justify-between'>
      <Link to='/'>
        <span className='flex items-center'>
          <FaGhost className='f3 hot-pink' />
          <h1 className='f3 ma0 ml1'>mackie</h1>
        </span>
      </Link>
      <div>
        <Link href='https://github.com/macklinu'>
          <FaGithub className='f4 v-mid' />
        </Link>
        <Link href='https://twitter.com/macklinu'>
          <FaTwitter className='f4 v-mid' />
        </Link>
        <Link href='https://www.linkedin.com/in/macklinu'>
          <FaLinkedin className='f4 v-mid' />
        </Link>
      </div>
    </div>
  </nav>
)

export default Nav
