import React from 'react'

import CenteredSection from '../components/CenteredSection'
import Layout from '../components/Layout'
import Nav from '../components/Nav'

const SectionHeading = ({ children }) => (
  <h2 className='f2 black'>{children}</h2>
)

const NotFoundPage = () => (
  <Layout>
    <Nav />
    <CenteredSection>
      <SectionHeading>😅 idk where that page is, sorry</SectionHeading>
    </CenteredSection>
  </Layout>
)

export default NotFoundPage
