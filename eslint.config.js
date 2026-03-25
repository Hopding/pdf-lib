/*eslint no-undef: "off"*/
const eslint = require('@eslint/js');
const tseslint = require('@typescript-eslint/eslint-plugin');
const tsparser = require('@typescript-eslint/parser');
const prettier = require('eslint-plugin-prettier');
const globals = require('globals');

module.exports = [
  eslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx,js,jsx,mjs}','tests/**/*.{ts,tsx,js,jsx,mjs}','apps/**/*.{ts,tsx,js,jsx,mjs}'],
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
          ignoreRestSiblings: true,
        },
      ],
      'no-console': 'off',
      'no-empty-interface': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always'],
      'no-unused-vars': 'off',
      'no-dupe-class-members': 'off',
      'no-undef': 'off',
    },
  },
  {
    files: [
      'tests/**/*.{ts,tsx,js,jsx}',
      '**/*.spec.{ts,tsx,js,jsx}',
      '**/*.test.{ts,tsx,js,jsx}',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'quotes': 'off',
    },
  },
  {
    files: ['apps/rn/**/*.{ts,tsx,js,jsx,mjs}'],
    languageOptions: {
      globals: {
        require: 'readonly',
      },
    },
  },
  {
    files: ['apps/deno/**/*.{ts,tsx,js,jsx,mjs}'],
    languageOptions: {
      globals: {
        Deno: 'readonly',
      },
    },
  }
];
