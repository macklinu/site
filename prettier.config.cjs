/** @type {import ('prettier').Config} */
module.exports = {
  jsxSingleQuote: true,
  semi: false,
  singleQuote: true,
  trailingComma: 'es5',
  plugins: [require('prettier-plugin-astro')],
}
