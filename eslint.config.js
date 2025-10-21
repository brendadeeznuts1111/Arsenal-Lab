import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        process: 'readonly',
        global: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly'
      }
    },
    rules: {
      // General code quality rules
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      'no-debugger': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-arrow-callback': 'error',
      'prefer-template': 'error',

      // Security rules
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',

      // Performance rules
      'no-loop-func': 'warn',
      'prefer-spread': 'error',

      // Style rules
      'semi': ['error', 'always'],
      'quotes': ['error', 'double', { avoidEscape: true }],
      'indent': ['error', 2, { SwitchCase: 1 }],
      'comma-dangle': ['error', 'always-multiline'],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'computed-property-spacing': ['error', 'never'],
      'func-call-spacing': ['error', 'never'],
      'key-spacing': ['error', { beforeColon: false, afterColon: true }],
      'keyword-spacing': ['error', { before: true, after: true }],
      'space-before-blocks': ['error', 'always'],
      'space-before-function-paren': ['error', 'never'],
      'space-in-parens': ['error', 'never'],
      'space-infix-ops': 'error',
      'space-unary-ops': 'error',
      'spaced-comment': ['error', 'always'],
      'brace-style': ['error', '1tbs', { allowSingleLine: true }],
      'comma-spacing': ['error', { before: false, after: true }],
      'eol-last': ['error', 'always']
    }
  },
  {
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    rules: {
      'no-console': 'off'
    }
  },
  {
    files: ['src/lab.ts', 'src/cli/**/*.ts'],
    rules: {
      'no-console': 'off'
    }
  },
  {
    files: ['scripts/**/*.ts', 'scripts/**/*.js'],
    rules: {
      'no-console': 'off'
    }
  },
  {
    ignores: [
      'dist/',
      'build/',
      'node_modules/',
      '.next/',
      'coverage/',
      '*.config.js',
      '*.config.ts',
      '*.d.ts'
    ]
  }
];
