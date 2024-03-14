import type { Config } from 'jest'

const config: Config = {

  coverageProvider: 'v8',
  roots: [
    '<rootDir>/src',
    '<rootDir>/tests'
  ],
  preset: 'ts-jest'
}

export default config
