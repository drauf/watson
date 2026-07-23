import { configs, plugins } from 'eslint-config-airbnb-extended';

export default [
  {
    ignores: ['build/**'],
  },
  ...Object.values(plugins),
  ...configs.base.all,
  ...configs.react.all,
  {
    rules: {
      '@stylistic/max-len': 'off',
      'react/react-in-jsx-scope': 'off',
      'no-restricted-syntax': [
        'error',
        'ForInStatement',
        'LabeledStatement',
        'WithStatement',
      ],
      'jsx-a11y/label-has-associated-control': [
        'error',
        {
          required: {
            some: ['nesting', 'id'],
          },
        },
      ],
      'react/prop-types': 'off',
      'no-plusplus': 'off',
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'react/jsx-filename-extension': [
        'warn',
        { extensions: ['.tsx'] },
      ],
      'react/function-component-definition': [
        'warn',
        {
          namedComponents: 'arrow-function',
          unnamedComponents: 'arrow-function',
        },
      ],
    },
  },
  {
    files: ['e2e/**/*.{ts,tsx}', 'playwright.config.ts'],
    rules: {
      'import-x/no-extraneous-dependencies': ['error', { devDependencies: true }],
      'import-x/prefer-default-export': 'off',
      // Playwright fixture callbacks receive a function named use
      'react-hooks/rules-of-hooks': 'off',
      'no-await-in-loop': 'off',
    },
  },
  {
    files: ['src/**/*.test.{ts,tsx}', 'src/test-setup.ts'],
    rules: {
      'import-x/no-extraneous-dependencies': ['error', { devDependencies: true }],
    },
  },
];
