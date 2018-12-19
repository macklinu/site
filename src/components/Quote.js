import React from 'react'
import Macro from 'macro-components'

const macro = Macro({
  Text,
  Author,
  Icon,
})

export default macro(({ Text, Author, Icon }, { className = '' }) => {
  return (
    <blockquote
      className={[
        'ma1 br3 ph3 ph4-ns ba b--black-10 w-50-ns w-100 flex flex-column justify-between',
        className,
      ].join(' ')}
    >
      {Text}
      <cite className='flex items-center pb4'>
        {Icon}
        {Author}
      </cite>
    </blockquote>
  )
})

function Text({ children }) {
  return <p className='f3 lh-copy'>{children}</p>
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
