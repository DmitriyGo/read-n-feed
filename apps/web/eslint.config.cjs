const nx = require('@nx/eslint-plugin');
const baseConfig = require('../../eslint.config.cjs');
const tanstackQuery = require('@tanstack/eslint-plugin-query');

module.exports = [
  ...baseConfig,
  ...nx.configs['flat/react'],
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    // Override or add rules here
    rules: {},
    plugins: {
      '@tanstack/query': tanstackQuery,
    },
  },
];
