import * as React from 'react'
import { Container, NavLink } from './components'
import face from './mackie-face.png'

const Header = () => (
  <header className='flex flex-row py-4'>
    <NavLink to='/'>
      <div className='flex flex-row items-center'>
        <img alt="mackie's face" className='h-8 w-8' src={face} />
        <div className='px-1' />
        <h1 className='font-bold text-2xl'>mackie</h1>
      </div>
    </NavLink>
    <div className='mx-auto' />
    <div className='flex flex-row space-x-4 items-center mx-2'>
      <NavLink to='/about'>about</NavLink>
    </div>
  </header>
)

const Footer = () => (
  <footer className='py-8 bg-purple-100'>
    <Container className='flex flex-row items-center'>
      <div className='mx-auto' />
      <div className='flex flex-row space-x-4 justify-end mx-2'>
        <NavLink to='https://github.com/macklinu'>github</NavLink>
        <NavLink to='https://twitter.com/macklinu'>twitter</NavLink>
        <NavLink to='https://linkedin.com/in/macklinu'>linkedin</NavLink>
      </div>
    </Container>
  </footer>
)

export const PageLayout = ({ children }) => (
  <div className='h-screen antialiased'>
    <div>
      <Container>
        <Header />
      </Container>
      {children}
      <Footer />
    </div>
  </div>
)
