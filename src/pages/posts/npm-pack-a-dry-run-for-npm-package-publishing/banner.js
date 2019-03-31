import React from 'react'
import { Box, Text } from '../../../components'

const Banner = ({ children }) => (
  <Box backgroundColor='tertiary' borderRadius={2}>
    <Text as='p' fontSize={[2, 3]} lineHeight={1.625} p={2}>
      {children}
    </Text>
  </Box>
)

export default Banner
