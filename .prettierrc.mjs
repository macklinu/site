/** @type {import("prettier").Config} */
export default {
  jsxSingleQuote: true,
  semi: false,
  singleQuote: true,
  trailingComma: "es5",
  plugins: ["prettier-plugin-astro"],
  overrides: [
    {
      files: "*.astro",
      options: {
        parser: "astro",
      },
    },
  ],
};
