import config from '@macklinu/prettier-config'

export default {
  ...config,
  plugins: [
    '@ianvs/prettier-plugin-sort-imports',
    'prettier-plugin-astro',
    'prettier-plugin-tailwindcss',
  ],
  importOrder: [
    '<BUILTIN_MODULES>', // Node.js built-in modules
    '',
    '<THIRD_PARTY_MODULES>', // Imports not matched by other special words or groups.
    '',
    '^~/(.*)$', // Project-local aliased imports
    '',
    '^[.]', // relative imports
  ],
}
