import * as React from 'react'
import { PageLayout } from './page-layout'

export default function PostLayout({ children, pageContext: { frontmatter } }) {
  return (
    <PageLayout>
      <h1 className='mb-2'>{frontmatter.title}</h1>
      {frontmatter.date && (
        <>
          <date className='text-gray-600 my-2'>
            {frontmatter.date.slice(0, 10)}
          </date>{' '}
          <div className='py-2' />
        </>
      )}

      <article>{children}</article>
    </PageLayout>
  )
}
