import React from 'react'
import Layout from '../components/layout'
import Nav from '../components/Nav'

export default function NotFoundPage() {
  return (
    <Layout>
      <Nav />
      <Section>
        <SectionHeading>😅 idk where that page is, sorry</SectionHeading>
      </Section>
    </Layout>
  )
}

function Section({ children }) {
  return <section className='mw7-ns center ph3 pv2'>{children}</section>
}

function SectionHeading({ children }) {
  return <h2 className='f2 black'>{children}</h2>
}
