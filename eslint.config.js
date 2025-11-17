import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier';  // NEW: Formatting enforcer
import a11y from 'eslint-plugin-jsx-a11y';     // NEW: Accessibility (WCAG-compliant)
import importPlugin from 'eslint-plugin-import'; // NEW: Import sorting/organization
import security from 'eslint-plugin-security'; // NEW: Security vuln detection

export default tseslint.config(
  // ENHANCED: Merged ignores (alpha-sorted, comprehensive for mobile/hybrid)
  { ignores: ['dist/**', 'mobile/**', 'mobile_app/**', 'node_modules/**', '*.config.js'] },  // Added globs for safety; ignore configs too

  // BASE: Core TS/React linting (your original + merged)
  {
    extends: [
      js.configs.recommended,  // JS basics (no-eval, etc.)
      ...tseslint.configs.recommended,  // TS parser + strict type rules
    ],
    files: ['**/*.{ts,tsx,js,jsx}'],  // ENHANCED: Include JS/JSX for full coverage
    languageOptions: {
      ecmaVersion: 2022,  // ENHANCED: ES2022+ (top-level await, private fields)
      sourceType: 'module',  // ENHANCED: ESM default for modern React
      globals: {
        ...globals.browser,  // Browser APIs (window, document)
        ...globals.node,     // ENHANCED: Node globals if SSR (Next.js/Vite hybrid)
      },
      parserOptions: {
        project: './tsconfig.json',  // ENHANCED: Use TS project for type-aware linting
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'prettier': prettier,      // NEW: Prettier as plugin
      'jsx-a11y': a11y,          // NEW: A11y rules
      'import': importPlugin,    // NEW: Import resolver
      'security': security,      // NEW: Security audits
    },
    settings: {
      react: { version: 'detect' },  // ENHANCED: Auto-detect React version (18/19)
      'import/resolver': {           // ENHANCED: Resolve TS/JS paths
        typescript: { project: './tsconfig.json' },
      },
    },
    rules: {
      // MERGED BASE: Hooks + TS (your resolved)
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],  // Merged: Ignore _ prefixed
      '@typescript-eslint/no-explicit-any': 'warn',  // Merged: Soft-ban any

      // ENHANCED: Prettier (format on lint)
      'prettier/prettier': 'error',

      // ENHANCED: Accessibility (2025 must-have for inclusive UI)
      'jsx-a11y/alt-text': 'warn',  // Img alt attrs
      'jsx-a11y/anchor-is-valid': ['error', { aspects: ['invalidHref'] }],
      'jsx-a11y/heading-has-content': 'error',
      'jsx-a11y/label-has-associated-control': 'error',
      'jsx-a11y/no-noninteractive-element-interactions': 'warn',

      // ENHANCED: Import hygiene (prevents cycles, sorts)
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
          'newlines-between': 'always',
        },
      ],
      'import/no-cycle': 'error',
      'import/no-duplicates': 'error',

      // ENHANCED: Security (scan for vulns like eval, weak crypto)
      'security/detect-object-injection': 'warn',
      'security/detect-non-literal-fs-filename': 'error',
      'security/detect-possible-timing-attacks': 'warn',
      'security/detect-no-csrf-before-method-override': 'error',

      // ENHANCED: Perf & Best Practices
      'no-console': ['warn', { allow: ['warn', 'error'] }],  // Ban logs except critical
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',  // Modern TS idioms
      '@typescript-eslint/no-non-null-assertion': 'warn',     // Discourage !
      'react/prop-types': 'off',  // ENHANCED: Off for TS (types replace PropTypes)
      'react/react-in-jsx-scope': 'off',  // ENHANCED: Off for React 17+ auto-import
    },
  },

  // ENHANCED: Separate config for JS/JSX (if non-TS files exist)
  {
    files: ['**/*.{js,jsx}'],
    ...js.configs.recommended,
    languageOptions: { ecmaVersion: 2022, sourceType: 'module' },
    rules: { 'no-unused-vars': 'warn' },  // Fallback for JS
  },
);