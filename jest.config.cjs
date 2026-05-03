// jest.config.cjs
module.exports = {
  testEnvironment: "jsdom",

  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

  transform: {
    "^.+\\.[jt]sx?$": "babel-jest",
  },

  testMatch: ["<rootDir>/src/**/*.jest.test.jsx"],

  moduleNameMapper: {
    "^@/utils/gameUtils\\.js$": "<rootDir>/src/test/mocks/gameUtils.mock.js",
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },

  clearMocks: true,
  restoreMocks: true,
};
