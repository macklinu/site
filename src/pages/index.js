import React from 'react'
import { StaticQuery, graphql } from 'gatsby'
import Layout from '../components/layout'
import { Heading, Flex, Link } from 'rebass'
import styled from 'styled-components'

let FullHeightCenter = styled(Flex).attrs({
  alignItems: 'center',
})`
  height: 100vh;
`

let ColoredLink = styled(({ children, bgColor, ...rest }) => (
  <Link p={[0, 1]} {...rest}>
    {children}
  </Link>
))`
  background-color: ${props => props.bgColor};
  color: white;
  text-decoration: none;
`

function getPostMetadata(data) {
  return data.allMdx.edges.map(edge => ({
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
          allMdx(
            filter: { frontmatter: { date: { ne: null } } }
            sort: { fields: [frontmatter___date], order: DESC }
          ) {
            edges {
              node {
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
        }
      `}
    >
      {data => (
        <Layout>
          <FullHeightCenter>
            <Heading fontSize={6}>
              <span role="img" aria-label="Hand waving">
                👋
              </span>{' '}
              i'm mackie. you may have seen me on{' '}
              <ColoredLink
                bgColor="#1da1f2"
                href="https://twitter.com/macklinu"
              >
                twitter
              </ColoredLink>{' '}
              or{' '}
              <ColoredLink bgColor="black" href="https://github.com/macklinu">
                github
              </ColoredLink>
              .
            </Heading>
          </FullHeightCenter>
        </Layout>
      )}
    </StaticQuery>
  )
}
