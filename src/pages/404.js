import React from 'react'
import Layout from '../components/layout'
import { Heading, Text, Flex } from 'rebass'
import styled from 'styled-components'

let FullHeightCenter = styled(Flex).attrs({
  alignItems: 'center',
})`
  height: 100vh;
`

const NotFoundPage = () => (
  <Layout>
    <FullHeightCenter>
      <Text>
        <Heading>not found</Heading>
        idk where that page is, sorry
      </Text>
    </FullHeightCenter>
  </Layout>
)

export default NotFoundPage
