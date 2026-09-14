module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', 'node_modules', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    // Type safety is enforced by `tsc` (strict) in the build; keep lint focused
    // on correctness smells rather than style noise.
    '@typescript-eslint/no-explicit-any': 'off',
    // HMR-only ergonomics rule; co-locating a context hook with its provider is
    // an intentional, common pattern here. Not a correctness concern.
    'react-refresh/only-export-components': 'off',
  },
}
