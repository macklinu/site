// @ts-check
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
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
      emitExternalStylesheet: false,
      themes: ["github-light-high-contrast", "github-dark-high-contrast"],
      themeCssSelector: (theme) => `[data-theme="${theme.type}"]`,
      useDarkModeMediaQuery: false,
      customizeTheme(theme) {
        theme.applyHueAndChromaAdjustments({
          accents: "#000000",
          backgrounds: "#000000",
        });
      },
      styleOverrides: {
        uiFontFamily: "var(--font-mono)",
        codeFontFamily: "var(--font-mono)",
        borderRadius: "0",
        borderWidth: "1px",
        borderColor: "var(--line)",
        codeBackground: "var(--surface)",
        focusBorder: "var(--focus)",
        frames: {
          editorBackground: "var(--surface)",
          editorTabBarBackground: "var(--line)",
          terminalBackground: "var(--surface)",
          terminalTitlebarBackground: "var(--line)",
          terminalTitlebarForeground: "var(--ink)",
          frameBoxShadowCssValue: "none",
        },
      },
    }),
    mdx(),
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
