import css from '@styled-system/css'
import React from 'react'
import { FiFileText, FiFolder } from 'react-icons/fi'
import styled from 'styled-components'

import { Box, Flex, Heading, Spacer, Text } from '../components'
import Layout from '../components/layout'
import NavLink from '../components/nav-link'

const Folder = styled(FiFolder)({})
const File = styled(FiFileText)({})

const List = styled('ul')(
  css({
    listStyle: 'none',
    paddingLeft: 0,
    '> *': {
      my: 2,
    },
  })
)

const ListItem = styled('li')(
  css({
    lineHeight: 1.25,
    paddingLeft: 2,
  }),
  css({
    '&::before': {
      paddingRight: 2,
    },
  })
)

const Notes = ({ pageContext: { groupedNotes } }) => (
  <Layout>
    <Heading>Notes</Heading>
    <Spacer mb={3} />
    <Flex flexDirection='column'>
      {Object.entries(groupedNotes)
        .sort()
        .map(([type, names]) => (
          <Box key={type}>
            <Text>
              <Folder css={css({ marginRight: 2 })} />
              {type}
            </Text>
            <List>
              {names.map(({ slug, name }) => (
                <ListItem key={name}>
                  <File css={css({ marginRight: 2 })} />
                  <NavLink to={slug}>{name}</NavLink>
                </ListItem>
              ))}
            </List>
          </Box>
        ))}
    </Flex>
  </Layout>
)

export default Notes
