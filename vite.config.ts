import { defineConfig } from "vite-plus";

export default defineConfig({
  lint: {
    plugins: ["import", "jsx-a11y", "nextjs", "oxc", "react", "typescript", "unicorn"],
    categories: {
      correctness: "error",
    },
    ignorePatterns: [
      "web/.next/**",
      "web/.open-next/**",
      "web/.wrangler/**",
      "web/cloudflare-env.d.ts",
      "web/next-env.d.ts",
      "web/out/**",
    ],
    options: {
      typeAware: true,
      typeCheck: true,
    },
    rules: {
      "vite-plus/prefer-vite-plus-imports": "error",
    },
    jsPlugins: [
      {
        name: "vite-plus",
        specifier: "vite-plus/oxlint-plugin",
      },
    ],
  },
});
