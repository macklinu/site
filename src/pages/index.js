import React from 'react'
import { StaticQuery, graphql } from 'gatsby'
import Layout from '../components/layout'
import Nav from '../components/Nav'
import Link from '../components/Link'
import Quote from '../components/Quote'
import { FaHatWizard, FaTruckMonster, FaCode } from 'react-icons/fa'

function getPostMetadata(data) {
  return data.allMarkdownRemark.edges.map(edge => ({
    id: edge.node.id,
    title: edge.node.frontmatter.title,
    date: edge.node.frontmatter.date,
    slug: edge.node.fields.slug,
  }))
}

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
                }
              }
            }
          }
        }
      `}
      render={data => {
        let posts = getPostMetadata(data)
        return (
          <Layout>
            <Nav />
            <Intro />
            <Testimonials />
            <Writings posts={posts} />
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
  return <h2 className='f2 black'>{children}</h2>
}

function Intro() {
  return (
    <Section>
      <SectionHeading>Hi, my name is Mackie.</SectionHeading>
      <p className='f4 lh-copy near-black'>
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
      <div className='flex flex-row-ns flex-column justify-between pa1'>
        <Quote className='bg-light-green black'>
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
        <Quote className='bg-light-green black'>
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
        {posts.map(({ slug, title, date, id }) => {
          return (
            <Link
              key={id}
              to={slug}
              className='link br2 black bg-animate hover-bg-light-green pa3 bb b--black-10 br2 f4'
            >
              <FaCode className='hot-pink' />
              <span className='ml2'>{title}</span>
            </Link>
          )
        })}
      </div>
    </Section>
  )
}
