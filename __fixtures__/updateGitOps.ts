import { jest } from '@jest/globals'

export const updateGitOps =
  jest.fn<typeof import('../src/updateGitOps.js').updateGitOps>()
