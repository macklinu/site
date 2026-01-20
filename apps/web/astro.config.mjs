// @ts-check
import react from '@astrojs/react'
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
      themes: ['vesper'],
      styleOverrides: {
        uiFontFamily: 'var(--font-mono)',
        codeFontFamily: 'var(--font-mono)',
        borderRadius: '0',
      },
    }),
    icon(),
  ],
  vite: {
    // @ts-expect-error
    plugins: [tailwind()],
  },
  server: {
    host: true,
  },
})
