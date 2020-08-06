module.exports = {
  purge: ['src/**/*.js'],
  theme: {
    typography(theme) {
      return {
        default: {
          css: {
            a: {
              color: theme('colors.blue.700'),
            },
          },
        },
      }
    },
  },
  variants: {},
  plugins: [require('@tailwindcss/typography')],
}
