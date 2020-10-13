/** @jsx jsx */
import { jsx } from '@emotion/core'
import { graphql, useStaticQuery, Link } from 'gatsby'
import { DateTime } from 'luxon'
import { PageLayout } from '../page-layout'

export default function IndexPage() {
  const query = useStaticQuery(graphql`
    query GetPosts {
      allMdx(
        filter: { fileAbsolutePath: { glob: "**/posts/**" } }
        sort: { order: DESC, fields: frontmatter___date }
      ) {
        nodes {
          id
          frontmatter {
            title
            date
          }
          fields {
            slug
          }
        }
      }
    }
  `)
  return (
    <PageLayout>
      <main className='prose'>
        {query.allMdx.nodes.map(({ id, fields, frontmatter }) => {
          return (
            <div key={id} className='py-1 flex flex-row justify-between'>
              <Link to={fields.slug}>{frontmatter.title}</Link>
              <time className='ml-4 text-sm text-gray-700'>
                {DateTime.fromISO(frontmatter.date).toLocaleString(
                  DateTime.DATE_FULL
                )}
              </time>
            </div>
          )
        })}
      </main>
    </PageLayout>
  )
}
