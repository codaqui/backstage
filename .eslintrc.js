module.exports = {
  root: true,
  extends: [
    '@spotify/eslint-config-base',
    '@spotify/eslint-config-typescript',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['import', '@typescript-eslint'],
  env: {
    node: true,
    es6: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  ignorePatterns: [
    '.eslintrc.*',
    '**/dist/**',
    '**/dist-types/**',
    '**/node_modules/**',
  ],
  rules: {
    // 🚫 Prevent use of 'any' type - forces explicit typing
    '@typescript-eslint/no-explicit-any': 'error',

    // 🚫 Prevent console statements in production code
    'no-console': [
      'error',
      {
        allow: ['warn', 'error'], // Allow console.warn and console.error for critical issues
      },
    ],

    // ✅ Require return types on functions for better documentation
    '@typescript-eslint/explicit-function-return-type': [
      'warn',
      {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
        allowHigherOrderFunctions: true,
      },
    ],

    // ✅ Prefer type imports for better tree-shaking
    '@typescript-eslint/consistent-type-imports': [
      'warn',
      {
        prefer: 'type-imports',
        fixStyle: 'separate-type-imports',
      },
    ],

    // ✅ Prevent unused variables
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
  },
  overrides: [
    {
      // Backend packages: Allow more console methods for debugging and logging
      files: ['packages/backend-*/**/*.ts', 'packages/backend-*/**/*.js'],
      rules: {
        'no-console': [
          'warn', // Warn instead of error for backend code
          {
            allow: ['log', 'info', 'warn', 'error', 'debug'], // Allow common logging methods
          },
        ],
      },
    },
    {
      // Frontend packages: Keep strict console rules but allow info for debugging
      files: ['packages/app/**/*.ts', 'packages/app/**/*.tsx'],
      rules: {
        'no-console': [
          'error',
          {
            allow: ['info', 'warn', 'error'], // Allow console.info for frontend debugging
          },
        ],
      },
    },
  ],
};
