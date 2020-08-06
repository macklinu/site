import * as React from 'react'
import { PageLayout } from './page-layout'

export default function PostLayout({ children, pageContext: { frontmatter } }) {
  return (
    <PageLayout>
      <main className='prose lg:prose-lg'>
        <h1>{frontmatter.title}</h1>
        {frontmatter.date && (
          <time className='text-gray-700 my-2'>
            {frontmatter.date.slice(0, 10)}
          </time>
        )}

        <article>{children}</article>
      </main>
    </PageLayout>
  )
}
