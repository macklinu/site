import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import react from '@astrojs/react'
import expressiveCode from 'astro-expressive-code'
import icon from 'astro-icon'
import cloudflare from '@astrojs/cloudflare'

// https://astro.build/config
export default defineConfig({
  site: import.meta.env.PROD
    ? 'https://mackie.underdown.wiki'
    : 'http://localhost:4321',
  adapter: cloudflare(),
  output: 'static',
  integrations: [
    tailwind(),
    react(),
    expressiveCode({
      shiki: {
        theme: 'github-dark',
      },
    }),
    icon(),
  ],
})
