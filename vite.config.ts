import { defineConfig } from "vite-plus";

export default defineConfig({
  lint: {
    plugins: ["import", "jsx-a11y", "nextjs", "oxc", "react", "typescript", "unicorn"],
    categories: {
      correctness: "warn",
    },
    ignorePatterns: [".next/**", ".open-next/**", "cloudflare-env.d.ts", "next-env.d.ts", "out/**"],
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
