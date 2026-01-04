// @ts-check
import react from '@astrojs/react'
import sanity from '@sanity/astro'
import tailwind from '@tailwindcss/vite'
import expressiveCode from 'astro-expressive-code'
import icon from 'astro-icon'
import { defineConfig } from 'astro/config'

// https://astro.build/config
export default defineConfig({
  site: import.meta.env.PROD ? 'https://mackie.underdown.wiki' : 'http://localhost:4321',
  output: 'static',
  prefetch: {
    defaultStrategy: 'load',
  },
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
      useCdn: false,
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
