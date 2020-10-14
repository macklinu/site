import * as React from 'react'
import { graphql, useStaticQuery, Link } from 'gatsby'
import { DateTime } from 'luxon'
import { PageLayout } from '../page-layout'
import 'twin.macro'

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
      <main tw='prose'>
        {query.allMdx.nodes.map(
          ({ id, fields, frontmatter: { title, date } }) => {
            return (
              <div key={id} tw='py-1 flex flex-row justify-between'>
                <Link to={fields.slug}>{title}</Link>
                <time tw='ml-4 text-sm text-gray-700'>
                  {DateTime.fromISO(date).toLocaleString(DateTime.DATE_FULL)}
                </time>
              </div>
            )
          }
        )}
      </main>
    </PageLayout>
  )
}
