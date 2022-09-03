module.exports = {
  'parser': '@typescript-eslint/parser',
  'plugins': ['jest'],
  'extends': [
    'eslint:recommended',
    'plugin:jest/recommended',
  ],
  'env': {
    'node': true,
  },
  'ignorePatterns': ['lib'],
  'rules': {
    'semi': [2, 'always'],
    'quotes': [2, 'single'],
    'comma-dangle': [2, 'always-multiline'],
    'no-console': 2,
  },
};