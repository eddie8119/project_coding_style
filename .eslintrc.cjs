module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'plugin:vue/vue3-recommended',
    'eslint:recommended',
    '@vue/typescript/recommended',
    'plugin:prettier/recommended', //自動關閉衝突 Integrates Prettier, must be last
  ],
  parser: 'vue-eslint-parser', // Main parser for .vue files
  parserOptions: {
    ecmaVersion: 'latest',
    parser: '@typescript-eslint/parser', // Parser for <script> blocks
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'import'],
  overrides: [
    {
      files: ['*.vue'],
      parser: 'vue-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
      },
      rules: {
        'vue/multi-word-component-names': 'off',
      },
    },
  ],
  rules: {
    'prettier/prettier': [
      'warn',
      {
        endOfLine: 'auto',
      },
    ],
    'vue/valid-template-root': 'off',
    'vue/no-unused-vars': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',

    'vue/max-attributes-per-line': [
      'error',
      {
        singleline: 3,
        multiline: 1,
      },
    ],
    'vue/html-self-closing': [
      'error',
      {
        html: {
          void: 'always',
          normal: 'always',
          component: 'always',
        },
      },
    ],
    'vue/html-indent': ['error', 2],
    'vue/html-closing-bracket-newline': [
      'error',
      {
        singleline: 'never',
        multiline: 'always',
      },
    ],
    'vue/first-attribute-linebreak': [
      'error',
      {
        singleline: 'ignore',
        multiline: 'below',
      },
    ],
    'vue/multiline-html-element-content-newline': 'error',
    'vue/singleline-html-element-content-newline': 'off', //ESLint 和 Prettier衝突 取Prettier
    'vue/multi-word-component-names': 'off',
    'import/order': [
      'warn',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    'sort-imports': [
      'warn',
      {
        // 忽略 import 語句的順序（由 import/order 處理）
        ignoreDeclarationSort: true,
        // 只排序具名引入內部的成員
        ignoreMemberSort: false,
        // 成員排序方式
        memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
        // 忽略大小寫
        ignoreCase: true,
      },
    ],
  },
};
