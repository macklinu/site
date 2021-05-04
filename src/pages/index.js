import * as React from 'react'
import { graphql, useStaticQuery } from 'gatsby'
import { GatsbySeo } from 'gatsby-plugin-next-seo'
import { DateTime } from 'luxon'
import cx from '@macklinu/cx'
import { PageLayout } from '../page-layout'
import { Container, Link } from '../components'

const SectionHeading = ({ className, children, ...props }) => (
  <h2
    className={cx(
      'leading-9 tracking-tight text-3xl font-extrabold',
      className
    )}
    {...props}
  >
    {children}
  </h2>
)

const Post = ({ title, date, href }) => (
  <div className='flex flex-col'>
    <Link
      className='text-xl tracking-tight font-medium hover:underline text-gray-900'
      to={href}
    >
      {title}
    </Link>
    <time className='text-base text-gray-700 leading-6'>
      {DateTime.fromISO(date).toLocaleString(DateTime.DATE_FULL)}
    </time>
  </div>
)

const Project = ({ title, description, href }) => (
  <div className='inline-flex flex-col'>
    <Link
      className='text-xl tracking-tight font-medium hover:underline text-gray-900'
      to={href}
    >
      {title}
    </Link>
    <p className='text-base text-gray-700'>{description}</p>
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
      <main className='flex flex-col max-w-none'>
        <section className='py-12 sm:py-20 bg-gradient-to-b from-yellow-100 to-orange-100'>
          <Container className='max-w-3xl px-4'>
            <p className='font-medium text-4xl leading-snug'>
              <span role='img' aria-label='Waving hand'>
                👋
              </span>{' '}
              I'm <span className='font-bold'>Mackie</span>, a software engineer
              and musician. I enjoy creating music, art, and software and
              helping others do the same.
            </p>
          </Container>
        </section>
        <section className='py-8 bg-gradient-to-b from-orange-100 to-red-100'>
          <Container className='max-w-3xl px-4'>
            <SectionHeading className='pb-4'>Writing</SectionHeading>
            <ul className='space-y-4'>
              {query.allMdx.nodes
                .map((node) => ({
                  id: node.id,
                  href: node.fields.slug,
                  title: node.frontmatter.title,
                  date: node.frontmatter.date,
                }))
                .map(({ id, ...props }) => (
                  <li key={id}>
                    <Post {...props} />
                  </li>
                ))}
            </ul>
          </Container>
        </section>
        <section className='py-8 bg-gradient-to-b from-red-100 to-purple-100'>
          <Container className='max-w-3xl px-4'>
            <SectionHeading className='pb-4'>Projects</SectionHeading>
            <ul className='space-y-4'>
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
