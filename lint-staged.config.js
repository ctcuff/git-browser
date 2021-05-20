module.exports = {
  './src/**/*{.scss,.js,.jsx,.ts,.tsx}': ['prettier --write'],
  // Compiles all TypeScript without emitting JS files to
  // check for type errors. This is specified in a separate file
  // so that lint-staged doesn't pass any arguments to tsc
  'src/**/*.ts?(x)': () => 'tsc -p tsconfig.json --noEmit',
  './src/**/*{.js,.jsx,.ts,.tsx}': ['yarn lint', 'yarn test --findRelatedTests']
}
