import * as React from 'react'
import { StaticImage } from 'gatsby-plugin-image'
import { GatsbySeo } from 'gatsby-plugin-next-seo'
import { PageLayout } from '../page-layout'
import { Container, Link } from '../components'

const AboutPage = () => {
  return (
    <PageLayout>
      <GatsbySeo title='About' />
      <main className='flex flex-col max-w-none'>
        <section className='py-20 bg-gradient-to-b from-yellow-100 to-orange-100'>
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
        <Container>
          <article className='prose lg:prose-lg max-w-none py-4 px-4 mb-4'>
            <figure className='float-left flex flex-col pr-6 pt-8'>
              <StaticImage
                src='../images/mackie-bday.jpg'
                alt='mackie at his surprise birthday party'
                height={320}
                placeholder='blurred'
                transformOptions={{ fit: 'cover' }}
              />
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
              startups in San Francisco to large companies in Detroit and
              throughout the United States, both in-person and remote. In
              addition to this experience, I have also contributed to various
              open source software projects, such as maintaining a couple of
              widely used ESLint plugins for a period of time
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
            <p>
              If you are curious about my work experience, please review my{' '}
              <Link to='https://linkedin.com/in/macklinu'>LinkedIn</Link> or{' '}
              <Link to='/resume'>resume</Link>.
            </p>
          </article>
        </Container>
      </main>
    </PageLayout>
  )
}

export default AboutPage
