import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'
import typography from '@tailwindcss/typography'

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    container: {
      padding: '1rem',
    },
    extend: {
      fontFamily: {
        sans: ['Inter var', 'Inter', ...defaultTheme.fontFamily.sans],
        mono: ['JetBrains Mono', ...defaultTheme.fontFamily.mono],
      },
    },
  },
  plugins: [typography],
} satisfies Config
