/** @type {import("prettier").Config} */
export default {
  plugins: ['prettier-plugin-astro'],
  overrides: [
    {
      files: '*.astro',
      options: {
        parser: 'astro',
        jsxSingleQuote: true,
        semi: false,
        singleQuote: true,
        trailingComma: 'es5',
      },
    },
  ],
}
