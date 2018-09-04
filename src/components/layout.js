import React from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'
import { injectGlobal } from 'styled-components'
import { Provider, Container, Border } from 'rebass'

injectGlobal`
* { box-sizing: border-box; }
body { margin: 0; }
`

function Layout({ children }) {
  return (
    <Provider>
      <Helmet title="mackie.world">
        <html lang="en" />
      </Helmet>
      <Border border={0} borderTop="4px solid" borderColor="teal">
        <Container>{children}</Container>
      </Border>
    </Provider>
  )
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
