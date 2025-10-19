// eslint.config.js

import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint"; // 👈 TypeScript support

export default tseslint.config(
  // Ignore built files
  { ignores: ["dist"] },

  // --- JS + TS config ---
  {
    files: ["**/*.{js,jsx,ts,tsx}"], // 👈 include TS files
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parser: tseslint.parser, // 👈 use TypeScript parser
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
        project: "./tsconfig.json", // optional but recommended for strict typing
      },
    },

    plugins: {
      "@typescript-eslint": tseslint.plugin, // 👈 TS plugin
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    env: {
      browser: false,
      node: true,
      es2021: true,
    },
    rules: {
      // --- Base ESLint ---
      ...js.configs.recommended.rules,
      "react-hooks/exhaustive-deps": "off",
      // --- TypeScript Recommended ---
      ...tseslint.configs.recommended.rules,

      // --- React Hooks + Fast Refresh ---
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],

      // --- Custom Rules ---
      "no-unused-vars": "off", // disable base rule
      "@typescript-eslint/no-unused-vars": [
        "error",
        { varsIgnorePattern: "^[A-Z_]", argsIgnorePattern: "^_" },
      ],
    },
  }
);
