import { FlatCompat } from "@eslint/eslintrc"
import path from "node:path"
import { fileURLToPath } from "node:url"

const currentDirectory = path.dirname(fileURLToPath(import.meta.url))
const compat = new FlatCompat({ baseDirectory: currentDirectory })

const config = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "public/**",
      "protected-docs/**",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // The repository contains an older v0 storefront alongside Murrumbella.
    // Keep its existing cleanup items visible without making the property
    // release fail on unrelated copy and navigation conventions.
    rules: {
      "@next/next/no-html-link-for-pages": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "react/no-unescaped-entities": "off",
    },
  },
]

export default config
