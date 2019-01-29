import React from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'
import { createGlobalStyle } from 'styled-components'
import { StaticQuery, graphql } from 'gatsby'
import mackie from '../images/mackie.jpg'

import 'tachyons'

const Reset = createGlobalStyle`
* { box-sizing: border-box; }
`

function googleMeta({ title, description, image }) {
  return [
    { itemprop: 'name', content: title },
    { itemprop: 'description', content: description },
    { itemprop: 'image', content: image },
  ]
}

function twitterMeta({ title, description, image }) {
  return [
    { name: 'twitter:card', content: 'summary' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:site', content: '@macklinu' },
    { name: 'twitter:image', content: image },
    { name: 'twitter:image:alt', content: "mackie's face" },
  ]
}

function openGraphMeta({ title, description, image }) {
  return [
    { name: 'og:title', content: title },
    { name: 'og:description', content: description },
    { name: 'og:image', content: image },
    { name: 'og:image:alt', content: "mackie's face" },
    { name: 'og:site_name', content: title },
    { name: 'og:locale', content: 'en_US' },
    { name: 'og:type', content: 'website' },
  ]
}

function Layout({ children }) {
  return (
    <StaticQuery
      query={graphql`
        query SiteTitleQuery {
          site {
            siteMetadata {
              title
              description
            }
          }
        }
      `}
      render={data => {
        let title = data.site.siteMetadata.title
        let description = data.site.siteMetadata.description
        return (
          <>
            <Helmet
              title={title}
              meta={[
                { charSet: 'utf-8' },
                {
                  name: 'viewport',
                  content: 'width=device-width, initial-scale=1',
                },
                { name: 'description', content: description },
                { name: 'image', content: mackie },
                ...openGraphMeta({ title, description, image: mackie }),
                ...googleMeta({ title, description, image: mackie }),
                ...twitterMeta({ title, description, image: mackie }),
              ]}
            >
              <html lang='en' />
              <Reset />
              <body className='sans-serif bg-near-white dark-gray' />
            </Helmet>
            {children}
          </>
        )
      }}
    />
  )
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
