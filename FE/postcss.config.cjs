/** PostCSS (CommonJS) — avoids ESM/createRequire issues on Node 20+ / Vercel. */
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
