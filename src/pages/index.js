import css from '@styled-system/css'
import { graphql, useStaticQuery } from 'gatsby'
import React from 'react'
import { FiBookOpen, FiBox, FiCode } from 'react-icons/fi'
import styled from 'styled-components'

import { Box, Flex, Heading, Spacer, Text } from '../components'
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
        <Flex flexDirection='row' alignItems='center' height='100%'>
          <FiBookOpen css={css({ fontSize: 4 })} />
          <Spacer marginRight={2} />
          <Heading lineHeight={1.25}>Writings</Heading>
        </Flex>
        <List>
          {data.allMarkdownRemark.edges.map(({ node }) => (
            <ListItem key={node.id}>
              <NavLink to={node.fields.slug}>{node.frontmatter.title}</NavLink>
            </ListItem>
          ))}
        </List>
      </Box>
      <Box as='section' my={3}>
        <Flex flexDirection='row' alignItems='center' height='100%'>
          <FiBox css={css({ fontSize: 4 })} />
          <Spacer marginRight={2} />
          <Heading lineHeight={1.25}>Projects</Heading>
        </Flex>
        <List>
          {data.allProjectsYaml.edges.map(({ node }) => (
            <ListItem key={node.id}>
              <NavLink to={node.url}>{node.name}</NavLink>
            </ListItem>
          ))}
        </List>
      </Box>
      <Box as='section' my={3}>
        <Flex flexDirection='row' alignItems='center'>
          <FiCode css={css({ fontSize: 4 })} />
          <Spacer marginRight={2} />
          <Heading lineHeight={1.25}>Open Source Contributions</Heading>
        </Flex>
        <List>
          {data.allOssYaml.edges
            .map(edge => edge.node)
            .sort(ossComparator)
            .map(oss => (
              <ListItem key={oss.id}>
                <NavLink to={oss.url}>{oss.name}</NavLink>
              </ListItem>
            ))}
        </List>
      </Box>
    </Layout>
  )
}

export default IndexPage
