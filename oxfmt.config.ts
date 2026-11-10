import config from '@macklinu/oxfmt-config'

export default {
  ...config,
  ignorePatterns: [
    ...config.ignorePatterns,
    '.agents/**',
    '.claude/**',
    'skills-lock.json',
    '**/*.astro',
  ],
}
