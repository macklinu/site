// @ts-check
import react from "@astrojs/react";
import tailwind from "@tailwindcss/vite";
import expressiveCode from "astro-expressive-code";
import icon from "astro-icon";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: import.meta.env.PROD ? "https://mackie.underdown.wiki" : "http://localhost:4321",
  output: "static",
  integrations: [
    react(),
    expressiveCode({
      themes: ["night-owl-light", "night-owl"],
      themeCssSelector: (theme) => `[data-theme="${theme.type}"]`,
      useDarkModeMediaQuery: false,
      styleOverrides: {
        uiFontFamily: "var(--font-mono)",
        codeFontFamily: "var(--font-mono)",
        borderRadius: "0",
        borderColor: "var(--line)",
        focusBorder: "var(--focus)",
        frames: {
          frameBoxShadowCssValue: "none",
        },
      },
    }),
    icon(),
  ],
  vite: {
    plugins: [tailwind()],
    server: {
      host: true,
      watch: {
        ignored: ["**/.alchemy/**"],
      },
    },
  },
});
