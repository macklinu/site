module.exports = {
  siteMetadata: {
    title: 'mackie.world',
    description:
      'my name is mackie. i am a front-end engineer and musician. welcome to my site.',
  },
  plugins: [
    'gatsby-plugin-react-helmet',
    'gatsby-plugin-emotion',
    {
      resolve: 'gatsby-transformer-remark',
      options: {
        gfm: true,
        plugins: ['gatsby-remark-emoji'],
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'posts',
        path: `${__dirname}/src/pages/posts/`,
      },
    },
    {
      resolve: 'gatsby-plugin-manifest',
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
  ],
}
