// @ts-check
import node from '@astrojs/node'
import react from '@astrojs/react'
import sanity from '@sanity/astro'
import sentry from '@sentry/astro'
import tailwind from '@tailwindcss/vite'
import expressiveCode from 'astro-expressive-code'
import icon from 'astro-icon'
import { defineConfig } from 'astro/config'

// https://astro.build/config
export default defineConfig({
  site: import.meta.env.PROD
    ? 'https://mackie.underdown.wiki'
    : 'http://localhost:4321',
  adapter: node({ mode: 'standalone' }),
  output: 'server',
  integrations: [
    react(),
    expressiveCode({
      themes: ['catppuccin-mocha', 'catppuccin-latte'],
    }),
    icon(),
    sanity({
      projectId: '7ba2ardr',
      dataset: 'production',
      perspective: import.meta.env.PROD ? 'published' : 'drafts',
      useCdn: true,
    }),
    sentry({
      project: 'mackie-underdown-wiki',
      org: 'fairfield-consulting-llc',
      authToken: import.meta.env.SENTRY_AUTH_TOKEN,
      enabled: import.meta.env.PROD,
    }),
  ],
  vite: {
    // @ts-expect-error
    plugins: [tailwind()],
  },
  server: {
    host: true,
  },
})
