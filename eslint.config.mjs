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
      // allow the use of for...of which is supported by modern browser targets
      'no-restricted-syntax': [
        'error',
        'ForInStatement',
        'LabeledStatement',
        'WithStatement',
      ],
      // a label can associate its control through nesting or htmlFor and id, no need for both
      'jsx-a11y/label-has-associated-control': ['error', { assert: 'either' }],
      // TypeScript interfaces are the source of truth for component props
      'react/prop-types': 'off',
      // increment operators are allowed in conventional loop counters
      'no-plusplus': 'off',
      // allow warns and errors in the console
      'no-console': ['error', { allow: ['warn', 'error'] }],
      // keep function components consistent with existing arrow-function convention
      'react/function-component-definition': [
        'error',
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
