/*eslint no-undef: "off"*/
const eslint = require('@eslint/js');
const tseslint = require('@typescript-eslint/eslint-plugin');
const tsparser = require('@typescript-eslint/parser');
const prettier = require('eslint-plugin-prettier');
const globals = require('globals');

module.exports = [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'cjs/**',
      'es/**',
      'ts3.4/**',
      'coverage/**',
      'build/**',
      'apps/node-build/**',
      'src/packages/*/dist/**',
      'src/packages/standard-fonts/scripts/**',
      '**/*.min.js',
      '**/*.js.map',
      '**/*.d.ts.map',
      'tsBuildInfo.json',
    ],
  },
  eslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx,js,jsx,mjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
        ...globals.jest,
        process: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      prettier: prettier,
    },
    rules: {
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          trailingComma: 'all',
          semi: true,
        },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^(_|unused|UNUSED)',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      'no-console': 'off',
      curly: ['error', 'multi-line'],
      quotes: ['error', 'single', { avoidEscape: true }],
      'no-empty-interface': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always'],
      'no-multiple-empty-lines': ['error', { max: 1 }],
      'no-trailing-spaces': 'error',
      'eol-last': 'error',
      'no-unused-vars': 'off',
      'no-dupe-class-members': 'off',
    },
  },
  {
    files: [
      '**/tests/**/*.{ts,tsx,js,jsx}',
      '**/*.spec.{ts,tsx,js,jsx}',
      '**/*.test.{ts,tsx,js,jsx}',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['**/apps/rn/**/*.{ts,tsx,js,jsx,mjs}'],
    languageOptions: {
      globals: {
        require: 'readonly',
      },
    },
  },
  {
    files: ['**/apps/deno/**/*.{ts,tsx,js,jsx,mjs}'],
    languageOptions: {
      globals: {
        Deno: 'readonly',
      },
    },
  },
];
