import { FlatCompat } from '@eslint/eslintrc'
import { fileURLToPath } from 'node:url'
import globals from 'globals'
import js from '@eslint/js'
import path from 'node:path'
import prettier from 'eslint-plugin-prettier'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

export default [
  {
    ignores: ['**/dist/', '**/node_modules/'],
  },
  ...compat.extends('eslint:recommended', 'plugin:prettier/recommended'),
  {
    plugins: {
      prettier,
    },

    languageOptions: {
      globals: {
        ...globals.node,
      },

      ecmaVersion: 2021,
      sourceType: 'module',
    },

    rules: {
      'prettier/prettier': 'error',
      'no-console': 'off',
      'prefer-const': 'warn',
      'consistent-return': 'warn',

      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    files: ['**/*.js'],
    rules: {},
  },
]
