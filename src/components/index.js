import { css } from '@styled-system/css'
import styled from 'styled-components'
import {
  alignItems,
  alignSelf,
  borders,
  color,
  flex,
  flexDirection,
  flexWrap,
  fontFamily,
  fontSize,
  fontWeight,
  justifyContent,
  letterSpacing,
  lineHeight,
  order,
  space,
  textAlign,
  width,
} from 'styled-system'

const Box = styled('div')(
  { boxSizing: 'border-box' },
  space,
  color,
  width,
  fontSize,
  flex,
  order,
  alignSelf,
  borders
)

Box.displayName = 'Box'

Box.propTypes = {
  ...space.propTypes,
  ...color.propTypes,
  ...width.propTypes,
  ...fontSize.propTypes,
}

const Spacer = styled('div')({ boxSizing: 'border-box' }, space)

Spacer.displayName = 'Spacer'

const Flex = styled(Box)(
  { display: 'flex' },
  flexWrap,
  flexDirection,
  alignItems,
  justifyContent
)

Flex.displayName = 'Flex'

Flex.propTypes = {
  ...flexWrap.propTypes,
  ...flexDirection.propTypes,
  ...alignItems.propTypes,
  ...justifyContent.propTypes,
}

const Text = styled(Box)(
  fontFamily,
  fontWeight,
  textAlign,
  lineHeight,
  letterSpacing
)

Text.propTypes = {
  ...fontFamily.propTypes,
  ...fontWeight.propTypes,
  ...textAlign.propTypes,
  ...lineHeight.propTypes,
  ...letterSpacing.propTypes,
}

Text.defaultProps = {
  color: 'text',
}

const Heading = styled(Text)({})

Heading.defaultProps = {
  as: 'h2',
  m: 0,
  fontSize: 4,
  fontWeight: 'bold',
}

const Link = styled(Box)(css({ color: 'text' }))

Link.defaultProps = {
  as: 'a',
}

export { Box, Flex, Text, Heading, Link, Spacer }
