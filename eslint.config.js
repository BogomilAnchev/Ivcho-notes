import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import importPlugin from "eslint-plugin-import";
import promise from "eslint-plugin-promise";

export default [
  // Base JS recommended
  js.configs.recommended,

  // 1) Type-checked rules ONLY for application code
  ...tseslint.configs.recommendedTypeChecked.map((c) => ({
    ...c,
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      ...c.languageOptions,
      parserOptions: {
        ...c.languageOptions?.parserOptions,
        project: ["./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
  })),

  // 2) Non-type-checked rules for TS outside src (vite config, etc.)
  ...tseslint.configs.recommended.map((c) => ({
    ...c,
    files: ["*.ts", "*.mts", "*.cts", "vite.config.ts", "**/*.config.ts"],
    languageOptions: {
      ...c.languageOptions,
      parserOptions: {
        ...c.languageOptions?.parserOptions,
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
  })),

  // 3) React + project rules for src
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: {
      react,
      "react-hooks": reactHooks,
      import: importPlugin,
      promise,
    },
    settings: {
      react: { version: "detect" },
      "import/resolver": {
        typescript: { project: ["./tsconfig.app.json"] },
      },
    },
    rules: {
      // Prohibit default exports
      "import/no-default-export": "error",

      // Arrow functions only
      "func-style": ["error", "expression"],
      "prefer-arrow-callback": [
        "error",
        { allowNamedFunctions: false, allowUnboundThis: true },
      ],

      // No unused vars (TS-aware)
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],

      // Prefer async/await over then/catch
      "promise/prefer-await-to-then": "error",
      "promise/prefer-await-to-callbacks": "error",
      "promise/catch-or-return": ["error", { allowFinally: true }],

      // React hooks
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },

  // Allow default exports in config JS files (if any)
  {
    files: ["**/*.{js,cjs,mjs}", "eslint.config.js"],
    rules: {
      "import/no-default-export": "off",
    },
  },

  {
    ignores: ["dist/**", "node_modules/**", "coverage/**"],
  },
];
