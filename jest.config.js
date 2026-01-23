export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  testMatch: [
    '**/test/**/*.test.js',
    '**/__tests__/**/*.test.js',
    '**/__tests__/**/*.test.jsx'
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    'server/**/*.js',
    '!src/main.jsx',
    '!src/index.css'
  ],
  testPathIgnorePatterns: ['/node_modules/'],
  moduleFileExtensions: ['js', 'jsx', 'json', 'node']
};
