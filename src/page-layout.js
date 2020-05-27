import * as React from 'react'
import { Link } from 'gatsby'
import face from './mackie-face.png'

export const PageLayout = ({ children }) => (
  <div className='p-4 max-w-3xl mx-auto'>
    <header>
      <Link to='/'>
        <div className='inline-flex flex-row items-center'>
          <img alt="mackie's face" className='h-8 w-8' src={face} />
          <div className='px-1' />
          <h1 className='font-black text-2xl'>mackie.world</h1>
        </div>
      </Link>
    </header>
    <div className='py-2' />
    <main className='rich-text'>{children}</main>
  </div>
)
