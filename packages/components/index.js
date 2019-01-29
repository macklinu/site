import React from 'react'

const A = props => <a {...props} className='link underline blue' />

const Blockquote = props => (
  <blockquote {...props} className='ml0 mt0 pl3 bl bw2 b--light-blue' />
)

const P = props => <p {...props} className='lh-copy' />

const Pre = props => (
  <pre
    className='pa3 mt4 mb4 bg-dark-gray near-white'
    css={{ overflowX: 'auto' }}
    {...props}
  />
)

const Code = props => (
  <code
    css={{ fontFamily: '"Roboto Mono", Consolas, monaco, monospace' }}
    {...props}
  />
)

export { A, Blockquote, P, Pre, Code }
