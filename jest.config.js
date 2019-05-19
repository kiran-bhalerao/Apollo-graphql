module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['<rootDir>/node_modules/'],
  globals: {
    'ts-jest': {
      babelConfig: true
    }
  }
}
