import * as React from 'react'
import { PageLayout } from './page-layout'
import { DateTime } from 'luxon'
import { Container } from './components'
import 'twin.macro'

const PostTitle = ({ title, date }) => (
  <div tw='py-16 bg-gradient-to-r from-orange-200 to-red-200'>
    <Container tw='px-4'>
      <h1 tw='font-extrabold text-3xl leading-9 tracking-tight'>{title}</h1>
      {date ? (
        <time tw='text-base text-gray-700 font-medium my-2'>
          {DateTime.fromISO(date).toLocaleString(DateTime.DATE_FULL)}
        </time>
      ) : null}
    </Container>
  </div>
)

const PostLayout = ({
  children,
  pageContext: {
    frontmatter: { title, date },
  },
}) => (
  <PageLayout>
    <PostTitle title={title} date={date} />
    <Container>
      <article tw='prose lg:prose-lg max-w-none py-4 px-4'>{children}</article>
    </Container>
  </PageLayout>
)

export default PostLayout
