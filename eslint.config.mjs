import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";
import pluginPrettier from "eslint-plugin-prettier";

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ["**/*.{js,mjs,cjs,ts}"] },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.bun,
      },
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  prettier, // Menonaktifkan aturan ESLint yang konflik dengan Prettier
  {
    plugins: {
      prettier: pluginPrettier,
    },
    rules: {
      // Aturan linting
      quotes: ["error", "double", { avoidEscape: true }],
      semi: ["error", "always"],
      "prettier/prettier": [
        "error",
        {
          endOfLine: "auto", // Mengatasi masalah CRLF/LF
        },
      ],
    },
  },
  {
    ignores: ["public/*"],
  },
];
