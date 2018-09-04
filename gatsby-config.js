module.exports = {
  siteMetadata: {
    title: 'mackie.world',
    description:
      'my name is mackie. i am a front-end engineer and musician. welcome to my site.',
  },
  plugins: [
    'gatsby-plugin-react-helmet',
    'gatsby-plugin-styled-components',
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: 'gatsby-starter-default',
        short_name: 'starter',
        start_url: '/',
        background_color: '#663399',
        theme_color: '#663399',
        display: 'minimal-ui',
        icon: 'src/images/globe.png', // This path is relative to the root of the site.
      },
    },
    'gatsby-plugin-offline',
  ],
}
