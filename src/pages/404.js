import { css } from '@styled-system/css'
import React from 'react'
import { FiAlertCircle } from 'react-icons/fi'

import { Flex, Heading, Spacer, Text } from '../components'
import Layout from '../components/layout'

const NotFoundPage = () => (
  <Layout>
    <Flex flexDirection='row' alignItems='center'>
      <FiAlertCircle css={css({ fontSize: 6 })} />
      <Spacer mr={2} />
      <Flex flexDirection='column'>
        <Heading>404 Not Found</Heading>
        <Text fontSize={[2, 3]}>idk where that page is, sorry</Text>
      </Flex>
    </Flex>
  </Layout>
)

export default NotFoundPage
