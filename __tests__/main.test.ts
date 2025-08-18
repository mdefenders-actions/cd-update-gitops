/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * Uses Jest ESM mocking to replace dependencies with fixtures.
 */
import { jest } from '@jest/globals'
import * as core from '../__fixtures__/core.js'
import { updateGitOps } from '../__fixtures__/updateGitOps.js'
import { generateMarkDown } from '../__fixtures__/markDown.js'

jest.unstable_mockModule('@actions/core', () => core)
jest.unstable_mockModule('../src/updateGitOps.js', () => ({ updateGitOps }))
jest.unstable_mockModule('../src/markDown.js', () => ({ generateMarkDown }))

const { run } = await import('../src/main.js')

describe('main.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    updateGitOps.mockResolvedValue('commit-sha1')
    generateMarkDown.mockResolvedValue('markdown-report')
  })

  it('calls updateGitOps, generates markdown, sets outputs and summary', async () => {
    await run()
    expect(updateGitOps).toHaveBeenCalled()
    expect(generateMarkDown).toHaveBeenCalledWith('commit-sha1')
    expect(core.summary.addRaw).toHaveBeenCalledWith('markdown-report', true)
    expect(core.setOutput).toHaveBeenCalledWith('report', 'markdown-report')
    expect(core.setOutput).toHaveBeenCalledWith('commit-id', 'commit-sha1')
  })

  it('sets a failed status on error', async () => {
    updateGitOps.mockRejectedValueOnce(new Error('test error'))
    await run()
    expect(core.setFailed).toHaveBeenCalledWith('test error')
    expect(core.error).toHaveBeenCalledWith(
      'Action failed with error: test error'
    )
  })
  it('sets a failed status on unknown error', async () => {
    updateGitOps.mockRejectedValueOnce('test error')
    await run()
    expect(core.setFailed).toHaveBeenCalledWith('Unknown error occurred')
    expect(core.error).toHaveBeenCalledWith(
      'Action failed with an unknown error'
    )
  })
})
