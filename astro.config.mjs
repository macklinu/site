import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import react from '@astrojs/react'
import expressiveCode from 'astro-expressive-code'

// https://astro.build/config
export default defineConfig({
  site: 'https://mackie.world',
  integrations: [
    tailwind(),
    react(),
    expressiveCode({
      shiki: {
        theme: 'github-dark',
      },
    }),
  ],

  vite: {
    optimizeDeps: {
      exclude: ['@resvg/resvg-js'],
    },
  },
})
