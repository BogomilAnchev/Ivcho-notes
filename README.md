# Blank Vite + React + TypeScript

Blank **Vite + React + TypeScript** project with **preconfigured development rules and tooling**.

> Package versions reflect the **latest available on 8.02.2026**

---

## Getting Started

Before using this project, verify dependency freshness:

    npm outdated

If needed (**recommended**):

    npx npm-check-updates -u
    npm install

---

## Pre-requirements

- **Node.js** `>= 24.12.0`  
  Enforced via `package.json`

- **npm** `>= 11.3.0`  
  Enforced via `package.json`

- **VS Code** `>= 1.100.1`  
  Required for in-file underlining with the latest ESLint flat config support

### VS Code Extensions

- **Prettier** — `esbenp.prettier-vscode`
- **ESLint** — `dbaeumer.vscode-eslint`

---

## Included Setup

- Absolute path imports (`@/…`)

- Local **Prettier** with preset rules  
  → configurable via `.prettierrc.json`

- Local **ESLint** with preset rules  
  → configurable via `eslint.config.js` with initial rules for:
  - No default exports
  - Arrow functions only
  - No unused variables
  - Prefer async/await
  - Browser globals enabled
  - Type-aware linting
  - React hooks rules

- **SCSS Modules** support

- In-file, terminal, and browser warnings via `vite-plugin-checker`

- sharedStyles folder with basic abstraction and global stylesheets

- Preset `index.html` with basic meta tags

- Default template files and boilerplate removed

- Basic, scalable folder structure

---

## Scripts

    npm run dev          # Start dev server
    npm run build        # Type-check + build
    npm run preview      # Preview production build
    npm run lint         # Lint source files
    npm run lint:fix     # Lint + auto-fix
    npm run format       # Format files
    npm run format:check # Check formatting

---

## Notes

This repository is intended as a **clean baseline** from which one can start development without worrying for initial setup.

All rules and tooling are explicitly configured and easy to adjust.

No hidden defaults. No framework noise.
