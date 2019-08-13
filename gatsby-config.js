module.exports = {
  siteMetadata: {
    title: 'mackie.world',
    description:
      'my name is mackie. i am a software engineer and musician. welcome to my site.',
  },
  plugins: [
    'gatsby-theme-macklinu-portfolio',
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        name: 'mackie.world',
        short_name: 'mackie.world',
        start_url: '/',
        background_color: '#F8EAF4',
        theme_color: '#F8EAF4',
        display: 'minimal-ui',
        icon: 'src/images/globe.png', // This path is relative to the root of the site.
      },
    },
  ],
}
