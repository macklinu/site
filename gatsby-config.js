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
        name: 'mackie.world',
        short_name: 'mackie.world',
        start_url: '/',
        background_color: '#00ee87',
        theme_color: '#00ee87',
        display: 'minimal-ui',
        icon: 'src/images/globe.png', // This path is relative to the root of the site.
      },
    },
    'gatsby-plugin-offline',
  ],
}
