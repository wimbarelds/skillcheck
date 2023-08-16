/** @type {import('eslint').Linter.Config} */
module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  parser: '@babel/eslint-parser',
  parserOptions: {
    requireConfigFile: false,
    ecmaFeatures: {
      jsx: true,
    },
    project: ['./tsconfig.json'],
  },
  settings: {
    'react': { version: 'detect' },
    'import/parsers': {
      [require.resolve('@typescript-eslint/parser')]: ['.ts', '.mts', '.cts', '.tsx', '.d.ts'],
    },
    'import/resolver': {
      [require.resolve('eslint-import-resolver-node')]: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
      [require.resolve('eslint-import-resolver-typescript')]: {
        alwaysTryTypes: true,
      },
    },
  },
  reportUnusedDisableDirectives: true,
  plugins: ['react', 'simple-import-sort', 'unused-imports', '@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'airbnb',
    'airbnb/hooks',
    'plugin:react/jsx-runtime',
    'prettier',
  ],
  rules: {
    'react/jsx-filename-extension': ['error', { extensions: ['.tsx'] }],
    'import/prefer-default-export': 'off',
    'react/function-component-definition': [
      'error',
      { namedComponents: 'function-declaration', unnamedComponents: 'arrow-function' },
    ],
    'import/extensions': [
      'error',
      'always',
      { js: 'never', jsx: 'never', ts: 'never', tsx: 'never' },
    ],
    'react/require-default-props': 'off',
    'no-use-before-define': ['error', { functions: false }],
    'no-useless-return': 'off',
    'react/no-danger': 'error',
    'func-names': ['error', 'always'],
    'no-param-reassign': 'error',
    'react/destructuring-assignment': 'off',
    'dot-notation': 'error',
    'react/jsx-props-no-spreading': 'off',
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'off',
    'import/order': 'off', // Conflict with 'simple-import-sort/imports
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/no-duplicates': 'error',
    'unused-imports/no-unused-imports': 'error',
    'no-console': 'error',
    'react/no-unused-prop-types': 'off',
    'jsx-a11y/label-has-associated-control': ['error', { assert: 'either' }],
  },
  overrides: [
    {
      files: ['**/*.ts?(x)'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      plugins: ['@typescript-eslint'],
      extends: ['plugin:@typescript-eslint/recommended'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/no-use-before-define': ['error', { functions: false }],
        '@typescript-eslint/consistent-type-imports': [
          'error',
          { fixStyle: 'inline-type-imports' },
        ],
        '@typescript-eslint/dot-notation': 'error',
        'no-use-before-define': 'off',
        'dot-notation': 'off',
      },
    },
    {
      files: ['.*rc.{js,ts}', '*.config.{js,ts}', '**/*.d.ts'],
      rules: {
        'import/no-extraneous-dependencies': 'off',
      },
    },
  ],
};
