import css from '@styled-system/css'
import { graphql, useStaticQuery } from 'gatsby'
import React from 'react'
import styled from 'styled-components'

import { Box, Heading, Text } from '../components'
import Layout from '../components/layout'
import NavLink from '../components/nav-link'
import { ossComparator } from '../utils/comparator'

const List = styled('ul')({
  listStyle: 'none',
  paddingLeft: 0,
})

const ListItem = styled('li')(
  css({
    py: 1,
    fontSize: 3,
    lineHeight: 1.25,
  }),
  css({
    '&::before': {
      content: '"-"',
      paddingRight: 2,
    },
  })
)

const IndexPage = () => {
  const data = useStaticQuery(graphql`
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
  `)

  return (
    <Layout>
      <Box as='section'>
        <Text fontSize={4} lineHeight={1.5}>
          i'm mackie, a <strong>software engineer</strong> and{' '}
          <strong>musician</strong>. i love open-source software and javascript.
          i also love guitar 🎸, piano 🎹, cookies 🍪, and video games 🎮.
        </Text>
      </Box>
      <Box as='section' my={3}>
        <Heading lineHeight={1.25}>things i've written 📝</Heading>
        <List>
          {data.allMarkdownRemark.edges.map(({ node }) => (
            <ListItem key={node.id}>
              <NavLink to={node.fields.slug}>{node.frontmatter.title}</NavLink>
            </ListItem>
          ))}
        </List>
      </Box>
      <Box as='section' my={3}>
        <Heading lineHeight={1.25}>things i've built 👷‍♂️</Heading>
        <List>
          {data.allProjectsYaml.edges.map(({ node }) => (
            <ListItem key={node.id}>
              <NavLink to={node.url}>{node.name}</NavLink>
            </ListItem>
          ))}
        </List>
      </Box>
      <Box as='section' my={3}>
        <Heading lineHeight={1.25}>open source contributions 🤖</Heading>
        <List>
          {data.allOssYaml.edges
            .map(edge => edge.node)
            .sort(ossComparator)
            .map(oss => (
              <ListItem key={oss.id}>
                <NavLink to={oss.url}>{oss.name}</NavLink>
                {oss.type === 'maintainer' && (
                  <abbr title='I am a maintainer of this project!'>
                    <Text marginLeft={1} as='span'>
                      💖
                    </Text>
                  </abbr>
                )}
              </ListItem>
            ))}
        </List>
      </Box>
    </Layout>
  )
}

export default IndexPage
