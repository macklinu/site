import * as React from 'react'
import { graphql, useStaticQuery } from 'gatsby'
import Img from 'gatsby-image'
import { PageLayout } from '../page-layout'
import { Container, Link } from '../components'
import 'twin.macro'

const AboutPage = () => {
  const data = useStaticQuery(graphql`
    query {
      file(relativePath: { eq: "mackie-bday.jpg" }) {
        childImageSharp {
          fixed(width: 280) {
            ...GatsbyImageSharpFixed
          }
        }
      }
    }
  `)
  return (
    <PageLayout>
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
        <Container>
          <article tw='prose lg:prose-lg max-w-none py-4 px-4 mb-4'>
            <figure tw='float-left flex flex-col pr-6 mb-4!'>
              <Img fixed={data.file.childImageSharp.fixed} />
              <figcaption>Photo taken by my friend Nazir</figcaption>
            </figure>
            <p>
              I studied a mix of music, engineering, and art in{' '}
              <Link to='https://smtd.umich.edu/departments/performing-arts-technology/'>
                college
              </Link>
              , but I have spent my professional career working in the tech
              industry.
            </p>
            <p>
              I have experience with Android and full-stack web engineering
              (Node.js, TypeScript, React), with job experiences ranging from
              startups in San Francisco as well as large companies in Detroit
              and throughout the United States, both in-person and remote. In
              addition to these contributions, I have also contributed to
              various open source projects, such as maintaining a couple of
              widely used ESLint plugins for period of time
              <sup>
                <Link to='https://github.com/jest-community/eslint-plugin-jest'>
                  [1]
                </Link>
              </sup>
              <sup>
                <Link to='https://github.com/xjamundx/eslint-plugin-promise'>
                  [2]
                </Link>
              </sup>
              .
            </p>
            <p>
              Besides working with code, I enjoy playing music – guitar, bass,
              piano, and producing in Ableton Live. I also love to play
              basketball and video games.
            </p>
          </article>
        </Container>
      </main>
    </PageLayout>
  )
}

export default AboutPage
