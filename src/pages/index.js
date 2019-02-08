import React from 'react'
import { StaticQuery, graphql } from 'gatsby'
import Layout from '../components/layout'
import Nav from '../components/Nav'
import Link from '../components/Link'
import { FaExternalLinkAlt } from 'react-icons/fa'
import { Image, Flex, Box, Heading, Text, Card } from 'components'
import face from '../images/mackie-face.png'

const Avatar = props => (
  <Image width={48} height={48} borderRadius={9999} {...props} />
)

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
            {/* <Intro /> */}
            <OSS projects={data.allOssYaml.edges.map(({ node }) => node)} />
            <Writings
              posts={data.allMarkdownRemark.edges.map(({ node }) => ({
                id: node.id,
                title: node.frontmatter.title,
                date: node.frontmatter.date,
                slug: node.fields.slug,
                tags: new Set(node.frontmatter.tags),
              }))}
            />
            <Projects
              projects={data.allProjectsYaml.edges.map(({ node }) => ({
                id: node.id,
                url: node.url,
                name: node.name,
              }))}
            />
          </Layout>
        )
      }}
    />
  )
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
    <>
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
    </>
  )
}

function Intro() {
  return (
    <Card
      width={[1, 1, 1 / 2]}
      bg='#f6f6ff'
      borderRadius={8}
      boxShadow='0 2px 16px rgba(0, 0, 0, 0.25)'
    >
      <Flex alignItems='center' py={3}>
        <Avatar src={face} />
        <Box ml={1}>
          <Text>
            The personal website of{' '}
            <Text
              css={{ textDecoration: 'none' }}
              as={Link}
              to='https://twitter.com/macklinu'
            >
              mackie
            </Text>
          </Text>
          <Text>I make music, software, art, and cookies.</Text>
        </Box>
      </Flex>
    </Card>
  )
}

function Writings({ posts }) {
  return (
    <>
      <SectionHeading>Writings</SectionHeading>
      <div className='flex flex-column'>
        {posts.map(post => (
          <Post key={post.id} {...post} />
        ))}
      </div>
    </>
  )
}

function Projects({ projects }) {
  return (
    <>
      <SectionHeading>Projects</SectionHeading>
      <div className='flex flex-column'>
        {projects.map(project => (
          <Project key={project.id} {...project} />
        ))}
      </div>
    </>
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
