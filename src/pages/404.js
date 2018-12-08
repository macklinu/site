import React from 'react'
import Layout from '../components/layout'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function NotFoundPage() {
  return (
    <Layout>
      <Header />
      <section className='ph4'>
        <h1 class='f5 f4-ns fw6 black'>😅</h1>
        <h1 class='f5 f4-ns fw6 black'>idk where that page is, sorry</h1>
      </section>
      <Footer />
    </Layout>
  )
}
