import React from 'react'
import Macro from 'macro-components'

const macro = Macro({
  Text,
  Author,
  Icon,
})

export default macro(({ Text, Author, Icon }) => {
  return (
    <blockquote className='ml0 mt0 pl3 bl bw2 b--light-green'>
      {Text}
      <cite className='flex items-center pb4'>
        {Icon}
        {Author}
      </cite>
    </blockquote>
  )
})

function Text({ children }) {
  return <p className='f3 lh-copy georgia'>{children}</p>
}

function Author({ children }) {
  return (
    <span className='ml2'>
      <em>{children}</em>
    </span>
  )
}

function Icon({ children }) {
  return <>{children}</>
}
