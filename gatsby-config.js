module.exports = {
  siteMetadata: {
    title: 'mackie.world',
    description:
      'my name is mackie. i am a software engineer, musician, and artist. welcome to my site.',
  },
  plugins: [
    'gatsby-plugin-react-helmet',
    'gatsby-plugin-styled-components',
    {
      resolve: 'gatsby-transformer-remark',
      options: {
        gfm: true,
        plugins: [
          { resolve: 'gatsby-remark-emoji' },
          {
            resolve: 'gatsby-remark-component',
            options: { components: ['banner'] },
          },
        ],
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
        background_color: '#ff41b4',
        theme_color: '#ff41b4',
        display: 'minimal-ui',
        icon: 'src/images/globe.png', // This path is relative to the root of the site.
      },
    },
  ],
}
