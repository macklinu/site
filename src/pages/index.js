import React from 'react'
import { StaticQuery, graphql } from 'gatsby'
import Layout from '../components/layout'
import Nav from '../components/Nav'
import Link from '../components/Link'
import Quote from '../components/Quote'
import { FaHatWizard, FaTruckMonster, FaExternalLinkAlt } from 'react-icons/fa'

export default function IndexPage() {
  return (
    <StaticQuery
      query={graphql`
        {
          allMarkdownRemark(
            filter: { frontmatter: { date: { ne: null } } }
            sort: { fields: [frontmatter___date], order: DESC }
          ) {
            edges {
              node {
                id
                fields {
                  slug
                }
                frontmatter {
                  title
                  date(formatString: "MMM D, Y")
                  tags
                }
              }
            }
          }
          allProjectsYaml {
            edges {
              node {
                id
                name
                url
              }
            }
          }
          allOssYaml {
            edges {
              node {
                id
                name
                url
                type
              }
            }
          }
        }
      `}
      render={data => {
        return (
          <Layout>
            <Nav />
            <Intro />
            <OSS projects={data.allOssYaml.edges.map(edge => edge.node)} />
            <Writings
              posts={data.allMarkdownRemark.edges.map(edge => ({
                id: edge.node.id,
                title: edge.node.frontmatter.title,
                date: edge.node.frontmatter.date,
                slug: edge.node.fields.slug,
                tags: new Set(edge.node.frontmatter.tags),
              }))}
            />
            <Projects
              projects={data.allProjectsYaml.edges.map(edge => ({
                id: edge.node.id,
                url: edge.node.url,
                name: edge.node.name,
              }))}
            />

            <Testimonials />
          </Layout>
        )
      }}
    />
  )
}

function Section({ children }) {
  return <section className='mw7-ns center ph3 pv2'>{children}</section>
}

function SectionHeading({ children }) {
  return <h3 className='f3'>{children}</h3>
}

function OSS({ projects }) {
  function classesForType(type) {
    switch (type) {
      case 'maintainer':
        return 'bg-green white'
      case 'contributor':
        return 'bg-light-gray black'
      default:
        return 'bg-blue white'
    }
  }
  return (
    <Section>
      <SectionHeading>Open Source</SectionHeading>
      <div className='flex flex-column'>
        {projects
          .sort((a, b) => {
            if (a.type === 'maintainer' && b.type === 'maintainer') {
              return a.name.toLowerCase().localeCompare(b.name.toLowerCase())
            }
            return a.type === 'maintainer' ? -1 : 1
          })
          .map(({ id, name, type, url }) => (
            <Link
              key={id}
              to={url}
              className='link br2 dark-gray bg-animate hover-bg-lightest-blue pa3 bb b--black-10 br2 f4 flex flex-row justify-between'
            >
              <span className='ml2'>{name}</span>
              <div
                css={{
                  display: 'flex',
                  alignItems: 'center',
                  '& > *:not(:last-child)': { marginRight: 4 },
                }}
              >
                <Label className={`${classesForType(type)} dib-ns dn`}>
                  {type}
                </Label>
                <FaExternalLinkAlt className='pv1 ph2 br2' />
              </div>
            </Link>
          ))}
      </div>
    </Section>
  )
}

function Intro() {
  return (
    <Section>
      <h2 className='f2'>Hi, my name is Mackie.</h2>
      <p className='f4 lh-copy'>
        I am a <b>software engineer</b>, <b>musician</b>, and <b>artist</b>. I
        love contributing to open-source and working on JavaScript projects. I
        also like to play guitar, collect guitar pedals, bake cookies, and play
        video games.
      </p>
    </Section>
  )
}

function Testimonials() {
  return (
    <Section>
      <SectionHeading>Testimonials</SectionHeading>
      <div className='flex flex-column justify-between pa1'>
        <Quote>
          <Quote.Text>
            Mackie is very sweet and helpful, and his head is bald and smooth
            like a pumpkin.
          </Quote.Text>
          <Quote.Author>
            My wife{' '}
            <Link
              to='https://twitter.com/discountgourds'
              className='link blue underline'
            >
              @discountgourds
            </Link>
          </Quote.Author>
          <Quote.Icon>
            <FaHatWizard className='hot-pink' />
          </Quote.Icon>
        </Quote>
        <Quote>
          <Quote.Text>
            Nobody lives, loves or laughs harder than Mackie.
          </Quote.Text>
          <Quote.Author>
            My friend{' '}
            <Link
              to='https://twitter.com/davidklaw'
              className='link blue underline'
            >
              @davidklaw
            </Link>
          </Quote.Author>
          <Quote.Icon>
            <FaTruckMonster className='hot-pink' />
          </Quote.Icon>
        </Quote>
      </div>
    </Section>
  )
}

function Writings({ posts }) {
  return (
    <Section>
      <SectionHeading>Writings</SectionHeading>
      <div className='flex flex-column'>
        {posts.map(post => (
          <Post key={post.id} {...post} />
        ))}
      </div>
    </Section>
  )
}

function Projects({ projects }) {
  return (
    <Section>
      <SectionHeading>Projects</SectionHeading>
      <div className='flex flex-column'>
        {projects.map(project => (
          <Project key={project.id} {...project} />
        ))}
      </div>
    </Section>
  )
}

function Project({ url, name }) {
  return (
    <Link
      to={url}
      className='link br2 dark-gray bg-animate hover-bg-lightest-blue pa3 bb b--black-10 br2 f4 flex flex-row justify-between'
    >
      <span className='ml2'>{name}</span>
      <FaExternalLinkAlt className='pv1 ph2 br2' />
    </Link>
  )
}

function Post({ slug, title, id, tags }) {
  return (
    <Link
      to={slug}
      className='link br2 dark-gray bg-animate hover-bg-lightest-blue pa3 bb b--black-10 br2 f4 flex flex-row justify-between'
    >
      <span className='ml2'>{title}</span>
      <div
        css={{
          display: 'flex',
          alignItems: 'center',
          '& > *:not(:last-child)': { marginRight: 4 },
        }}
      >
        {Array.from(tags).map(tag => (
          <Label key={`${id}:${tag}`} className='bg-blue white dib-ns dn'>
            {tag}
          </Label>
        ))}
      </div>
    </Link>
  )
}

function Label({ className, children }) {
  return (
    <span className={['pv1 ph2 br2 f6', className].filter(Boolean).join(' ')}>
      {children}
    </span>
  )
}
