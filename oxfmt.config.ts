import config from '@macklinu/oxfmt-config'
import { defineConfig } from 'oxfmt'

export default defineConfig({
  ...config,
  ignorePatterns: [
    ...config.ignorePatterns,
    '.agents/**',
    '.claude/**',
    'skills-lock.json',
    '**/*.astro',
  ],
})
