import * as React from 'react'
import { PageLayout } from './page-layout'
import { DateTime } from 'luxon'

export default function PostLayout({ children, pageContext: { frontmatter } }) {
  return (
    <PageLayout>
      <main className='prose lg:prose-lg'>
        <h1>{frontmatter.title}</h1>
        {frontmatter.date && (
          <time className='text-gray-700 my-2 uppercase'>
            {DateTime.fromISO(frontmatter.date).toLocaleString(
              DateTime.DATE_FULL
            )}
          </time>
        )}
        <article>{children}</article>
      </main>
    </PageLayout>
  )
}
