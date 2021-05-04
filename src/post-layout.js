import * as React from 'react'
import { DateTime } from 'luxon'
import { GatsbySeo, BlogPostJsonLd } from 'gatsby-plugin-next-seo'
import { PageLayout } from './page-layout'
import { Container } from './components'

const PostTitle = ({ title, date }) => (
  <div className='py-16 bg-gradient-to-r from-orange-100 to-red-100'>
    <Container className='px-4'>
      <h1 className='font-extrabold text-3xl leading-9 tracking-tight'>
        {title}
      </h1>
      {date ? (
        <time className='text-base text-gray-700 font-medium my-2'>
          {DateTime.fromISO(date).toLocaleString(DateTime.DATE_FULL)}
        </time>
      ) : null}
    </Container>
  </div>
)

const PostLayout = ({
  children,
  path,
  pageContext: {
    frontmatter: { title, date },
  },
}) => (
  <PageLayout>
    <GatsbySeo title={title} />
    <BlogPostJsonLd
      url={`https://mackie.world${path}`}
      title={title}
      datePublished={date}
      authorName='Mackie Underdown'
    />
    <PostTitle title={title} date={date} />
    <Container>
      <article
        className='prose lg:prose-lg max-w-none py-4 px-4'
        css={{
          pre: {
            paddingLeft: 0,
            paddingRight: 0,
          },
        }}
      >
        {children}
      </article>
    </Container>
  </PageLayout>
)

export default PostLayout
