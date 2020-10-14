import * as React from 'react'
import { Link } from 'gatsby'
import { GlobalStyles } from 'twin.macro'
import face from './mackie-face.png'

export const PageLayout = ({ children }) => (
  <>
    <GlobalStyles />
    <div tw='py-4 max-w-3xl mx-auto'>
      <header>
        <Link to='/'>
          <div tw='inline-flex flex-row items-center'>
            <img alt="mackie's face" tw='h-8 w-8' src={face} />
            <div tw='px-1' />
            <h1 tw='font-black text-2xl'>mackie</h1>
          </div>
        </Link>
      </header>
      <div tw='py-2' />
      {children}
    </div>
  </>
)
