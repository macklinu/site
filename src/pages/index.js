import * as React from 'react'
import { graphql, useStaticQuery } from 'gatsby'
import { GatsbySeo } from 'gatsby-plugin-next-seo'
import { DateTime } from 'luxon'
import { PageLayout } from '../page-layout'
import { Container, Link } from '../components'
import tw from 'twin.macro'

const SectionHeading = tw.h2`leading-9 tracking-tight text-3xl font-extrabold`

const Post = ({ title, date, href }) => (
  <div tw='flex flex-row justify-between items-baseline'>
    <Link
      tw='text-xl tracking-tight font-medium hover:underline text-gray-900'
      to={href}
    >
      {title}
    </Link>
    <time tw='text-base text-gray-700 leading-6'>
      {DateTime.fromISO(date).toLocaleString(DateTime.DATE_FULL)}
    </time>
  </div>
)

const Project = ({ title, description, href }) => (
  <div tw='inline-flex flex-col'>
    <Link
      tw='text-xl tracking-tight font-medium hover:underline text-gray-900'
      to={href}
    >
      {title}
    </Link>
    <p tw='text-base text-gray-700'>{description}</p>
  </div>
)

const IndexPage = () => {
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
      <GatsbySeo titleTemplate='%s' />
      <main tw='flex flex-col max-w-none'>
        <section tw='py-20 bg-gradient-to-b from-yellow-200 to-orange-200'>
          <Container tw='max-w-3xl px-4'>
            <p tw='font-medium text-4xl leading-snug'>
              <span role='img' aria-label='Waving hand'>
                👋
              </span>{' '}
              I'm <span tw='font-bold'>Mackie</span>, a software engineer and
              musician. I enjoy creating music, art, and software and helping
              others do the same.
            </p>
          </Container>
        </section>
        <section tw='py-8 bg-gradient-to-b from-orange-200 to-red-200'>
          <Container tw='max-w-3xl px-4'>
            <SectionHeading tw='pb-4'>Writing</SectionHeading>
            <ul tw='space-y-4'>
              {query.allMdx.nodes
                .map((node) => ({
                  id: node.id,
                  href: node.fields.slug,
                  title: node.frontmatter.title,
                  date: node.frontmatter.date,
                }))
                .map((props) => (
                  <li key={props.id}>
                    <Post {...props} />
                  </li>
                ))}
            </ul>
          </Container>
        </section>
        <section tw='py-8 bg-gradient-to-b from-red-200 to-purple-200'>
          <Container tw='max-w-3xl px-4'>
            <SectionHeading tw='pb-4'>Projects</SectionHeading>
            <ul tw='space-y-4'>
              <li>
                <Project
                  title='fthrsn'
                  description='Music project from 2011-2013'
                  href='https://fthrsn.bandcamp.com'
                />
              </li>
              <li>
                <Project
                  title='repo.now.sh'
                  description='Find the repo for any npm package name'
                  href='https://repo.now.sh'
                />
              </li>
            </ul>
          </Container>
        </section>
      </main>
    </PageLayout>
  )
}

export default IndexPage
