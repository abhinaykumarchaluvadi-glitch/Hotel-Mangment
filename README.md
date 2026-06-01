# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## Vercel Deployment

This project is now prepared to deploy as a static Vite app on Vercel.

- `npm run build` will compile the app into `dist/`.
- `vercel.json` adds SPA fallback routing to support React Router on Vercel.
- `.vercelignore` keeps the backend folder out of the static deployment bundle.

### Production API behavior

- In production, the frontend now defaults to `'/api/v1'` for `VITE_API_BASE_URL`.
- For standalone deployment without a backend, the app still works in its built-in mock mode.
- If you deploy a backend separately, set `VITE_API_BASE_URL` in Vercel to your API root.

### Deploy steps

1. Push your project to GitHub.
2. Import the repository into Vercel.
3. In Vercel project settings, set:
   - `Build Command`: `npm run build`
   - `Output Directory`: `dist`
4. Optionally add the environment variable `VITE_API_BASE_URL` when using a deployed backend.

### GitHub Pages deployment

This repo can also deploy to GitHub Pages for a live demo on your GitHub account.

1. Install dependencies:
   - `npm install`
2. Build and deploy:
   - `npm run deploy`
3. The site will be published at:
   - `https://abhinaykumarchaluvadi-glitch.github.io/Hotel-Mangment`

> The `build:ghpages` script sets Vite to use the repository subpath so the app does not show a blank page on GitHub Pages.

## Automatic GitHub Pages deployment

A GitHub Actions workflow is included at `.github/workflows/deploy-gh-pages.yml`. It runs on every push to `main`, builds the app, and publishes the output to the `gh-pages` branch.

If you are still seeing a blank page, make sure GitHub Pages is configured to serve from the `gh-pages` branch.

