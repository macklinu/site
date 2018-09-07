import * as React from 'react'
import { MDXProvider } from '@mdx-js/tag'
import Layout from '../components/layout'
import createScope from '@rebass/markdown'

let components = createScope()

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function Post({ children, pageContext }) {
  let { title, date } = pageContext.frontmatter
  return (
    <Layout>
      <components.h1>{title}</components.h1>
      <components.p is="time" color="grey">
        {formatDate(date)}
      </components.p>
      <MDXProvider components={components}>{children}</MDXProvider>
    </Layout>
  )
}
