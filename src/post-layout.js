import * as React from 'react'
import { PageLayout } from './page-layout'
import { DateTime } from 'luxon'
import 'twin.macro'

export default function PostLayout({
  children,
  pageContext: {
    frontmatter: { title, date },
  },
}) {
  return (
    <PageLayout>
      <main tw='prose lg:prose-lg'>
        <h1>{title}</h1>
        {date && (
          <time tw='text-gray-700 my-2 uppercase'>
            {DateTime.fromISO(date).toLocaleString(DateTime.DATE_FULL)}
          </time>
        )}
        <article>{children}</article>
      </main>
    </PageLayout>
  )
}
