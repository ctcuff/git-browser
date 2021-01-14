module.exports = {
  setupFiles: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '\\.(css|scss)$': '<rootDir>/src/__mocks__/style-mock.js',
    'src/(.*)': '<rootDir>/src/$1',
    'tests/(.*)': '<rootDir>/src/__tests__/$1',
    'monaco-editor/esm/vs/editor/editor.api.js':
      '<rootDir>/src/__mocks__/editor.api.js',
    'firebase/(app|auth)': '<rootDir>/src/__mocks__/firebase',
    'react-modal': '<rootDir>/src/__mocks__/react-modal.js'
  },
  coveragePathIgnorePatterns: [
    '<rootDir>/src/components/', // Temporary
    '<rootDir>/src/lib/'
  ]
}
