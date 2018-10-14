import React from 'react'
import { StaticQuery, graphql, Link } from 'gatsby'
import Layout from '../components/layout'
import Header from '../components/Header'
import Footer from '../components/Footer'

function getPostMetadata(data) {
  return data.allMarkdownRemark.edges.map(edge => ({
    title: edge.node.frontmatter.title,
    date: edge.node.frontmatter.date,
    slug: edge.node.fields.slug,
  }))
}

function IndexWithData(data) {
  return (
    <Layout>
      <Header />
      <section className="ph4">
        <h1 class="f5 f4-ns fw6 black">writings</h1>
        {getPostMetadata(data).map(({ title, date, slug }) => (
          <article className="bb b--black-10 mw7">
            <Link to={slug} className="db pv2 no-underline black">
              <h2 className="f6 f5-ns fw6 lh-title black-70">{title}</h2>
              <h3 className="f6 fw4 mt0 black-60">{date}</h3>
            </Link>
          </article>
        ))}
      </section>
      <Footer />
    </Layout>
  )
}

export default function IndexPage() {
  return (
    <StaticQuery
      query={graphql`
        {
          allMarkdownRemark(
            filter: { frontmatter: { date: { ne: null } } }
            sort: { fields: [frontmatter___date], order: DESC }
          ) {
            edges {
              node {
                fields {
                  slug
                }
                frontmatter {
                  title
                  date
                }
              }
            }
          }
        }
      `}
      render={IndexWithData}
    />
  )
}
