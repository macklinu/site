import * as React from 'react'
import { GlobalStyles } from 'twin.macro'
import { Container, NavLink } from './components'
import face from './mackie-face.png'

const Header = () => (
  <header tw='flex flex-row py-4'>
    <NavLink to='/'>
      <div tw='flex flex-row items-center'>
        <img alt="mackie's face" tw='h-8 w-8' src={face} />
        <div tw='px-1' />
        <h1 tw='font-bold text-2xl'>mackie</h1>
      </div>
    </NavLink>
    <div tw='mx-auto' />
    <div tw='flex flex-row space-x-4 items-center'>
      <NavLink to='/about'>about</NavLink>
    </div>
  </header>
)

const Footer = () => (
  <footer tw='py-8 bg-purple-200'>
    <Container tw='flex flex-row items-center'>
      <div tw='mx-auto' />
      <div tw='flex flex-row space-x-4 justify-end'>
        <NavLink to='https://github.com/macklinu'>github</NavLink>
        <NavLink to='https://twitter.com/macklinu'>twitter</NavLink>
        <NavLink to='https://linkedin.com/in/macklinu'>linkedin</NavLink>
      </div>
    </Container>
  </footer>
)

export const PageLayout = ({ children }) => (
  <div tw='h-screen antialiased'>
    <GlobalStyles />
    <div>
      <Container>
        <Header />
      </Container>
      {children}
      <Footer />
    </div>
  </div>
)
