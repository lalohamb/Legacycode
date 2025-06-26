

# Detailed Explanation of `package.json` for LegacyCode
Below is a detailed explanation of each tool and line from final package.json file, segmented by scripts, dependencies, and devDependencies. 
This will help clarify their purpose and how they integrate into LegacyCode project. This document outlines the purpose and usage of each 
section and line within the final `package.json` configuration of the **LegacyCode** project.

---

## 📁 Project Metadata

```json
{
  "name": "vite-react-typescript-starter",
  "private": true,
  "version": "0.0.0",
  "type": "module",
```

* **name**: Identifier for your project. Here it's set to a default template name.
* **private**: Ensures the package won't be accidentally published to npm.
* **version**: Semantic versioning of the project.
* **type**: Declares that this is an ES module.

---

## ⚙️ Scripts

```json
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
```

* **dev**: Starts the development server using Vite.
* **build**: Bundles the project for production.
* **lint**: Runs ESLint to statically analyze the code for potential issues.
* **preview**: Launches a local server to preview the production build.

---

## 📦 Dependencies

```json
  "dependencies": {
    "@tanstack/react-query": "^5.28.4",
    "lucide-react": "^0.344.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.22.3",
    "react-dropzone": "^14.2.3",
    "qrcode.react": "^3.1.0",
    "wagmi": "^2.5.7",
    "viem": "^2.7.9",
    "@web3modal/wagmi": "^4.0.5"
  },
```

### Description:

* **@tanstack/react-query**: Manages server state fetching and caching.
* **lucide-react**: Provides clean and scalable React SVG icons.
* **react**/**react-dom**: Core libraries for building and rendering React UIs.
* **react-router-dom**: Declarative routing for React applications.
* **react-dropzone**: Easy drag-and-drop file uploads.
* **qrcode.react**: Generates QR codes using React components.
* **wagmi**: Hooks-based Web3 toolkit for Ethereum.
* **viem**: Type-safe Ethereum client for use with wagmi.
* **@web3modal/wagmi**: Connect wallet modal built for wagmi projects.

---

## 🛠️ DevDependencies

```json
  "devDependencies": {
    "@eslint/js": "^9.9.1",
    "@types/react": "^18.3.5",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.18",
    "eslint": "^9.9.1",
    "eslint-plugin-react-hooks": "^5.1.0-rc.0",
    "eslint-plugin-react-refresh": "^0.4.11",
    "globals": "^15.9.0",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.5.3",
    "typescript-eslint": "^8.3.0",
    "vite": "^5.4.2"
  }
```

### Description:

* **@eslint/js**: ESLint rules for JavaScript linting.
* **@types/react**, **@types/react-dom**: TypeScript type definitions for React.
* **@vitejs/plugin-react**: Enables React Fast Refresh and JSX support in Vite.
* **autoprefixer**: Adds vendor prefixes to CSS automatically.
* **eslint**: Static analysis tool to find and fix code issues.
* **eslint-plugin-react-hooks**: Enforces best practices for React Hooks.
* **eslint-plugin-react-refresh**: ESLint plugin for Fast Refresh support.
* **globals**: Provides global variables settings for ESLint.
* **postcss**: Processes CSS with plugins.
* **tailwindcss**: Utility-first CSS framework for building UIs.
* **typescript**: Adds TypeScript support.
* **typescript-eslint**: Integrates TypeScript with ESLint.
* **vite**: Fast, opinionated frontend build tool.

---

## 📚 Usage Context in LegacyCode

Each of these packages contributes to the **LegacyCode** ecosystem:

* **Frontend rendering** via React.
* **Web3 wallet and blockchain interaction** via wagmi and viem.
* **Decentralized file uploads** via IPFS.
* **Stateful caching** via React Query.
* **Security enforcement** via ESLint & Hooks.
* **Styling** via Tailwind and PostCSS.

This setup ensures a fast, scalable, and modular foundation for the LegacyCode app to manage digital capsules with secure, customizable unlock mechanisms.
