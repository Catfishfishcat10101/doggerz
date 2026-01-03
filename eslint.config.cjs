/** @format */

// eslint.config.cjs
// Flat-config ESLint setup for Vite + React (JS/JSX)

const js = require('@eslint/js');
const globals = require('globals');
const react = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const reactRefresh = require('eslint-plugin-react-refresh');

module.exports = [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'public/**',
      'android/**',
      'scripts/**',
      'coverage/**',
      '*.min.*',
    ],
  },

  js.configs.recommended,

  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        __APP_VERSION__: 'readonly',
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // React
      ...react.configs.recommended.rules,
      ...(react.configs['jsx-runtime']
        ? react.configs['jsx-runtime'].rules
        : {}),

      // Hooks
      ...reactHooks.configs.recommended.rules,

      // Vite HMR safety
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      // Practical defaults for this codebase
      'react/prop-types': 'off',
      'no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
];
