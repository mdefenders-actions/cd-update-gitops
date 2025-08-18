import { jest } from '@jest/globals'
import * as core from '../__fixtures__/core.js'
import * as fs from '../__fixtures__/fs.js'
import { exec } from '../__fixtures__/exec.js'
import { getInput } from './getInput.js'

jest.unstable_mockModule('@actions/core', () => core)
jest.unstable_mockModule('fs/promises', () => fs)
jest.unstable_mockModule('@actions/exec', () => ({ exec }))

const { updateGitOps } = await import('../src/updateGitOps.js')

describe('updateGitOps', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    core.getInput.mockImplementation((key) => {
      return getInput(key)
    })
    core.getBooleanInput.mockImplementation((key) => {
      if (key === 'dry-run') return false
      return false
    })
    fs.mkdir.mockResolvedValue(undefined)
    fs.writeFile.mockResolvedValue(undefined)
    exec.mockResolvedValue(0)
  })

  it('writes manifest, creates branch, commits, pushes, and returns SHA1', async () => {
    // let sha = ''
    exec.mockImplementation(async (cmd, args, opts) => {
      if (cmd === 'git' && (args?.[0] ?? '') === 'rev-parse') {
        opts?.listeners?.stdout?.(Buffer.from('commit-sha1'))
      }
      return Promise.resolve(0)
    })

    const result = await updateGitOps()
    expect(fs.mkdir).toHaveBeenCalledWith('deploy/environments/dev', {
      recursive: true
    })
    expect(fs.writeFile).toHaveBeenCalledWith(
      'deploy/environments/dev/values.yaml',
      expect.stringContaining('image: repo/image')
    )
    expect(exec).toHaveBeenCalledWith('git', ['checkout', 'feature-branch'])
    expect(exec).toHaveBeenCalledWith('git', [
      'push',
      '-u',
      'origin',
      'feature-branch'
    ])
    expect(result).toBe('commit-sha1')
  })

  it('skips git operations and returns empty string in dry-run mode', async () => {
    core.getBooleanInput.mockImplementation((key) => key === 'dry-run')
    const result = await updateGitOps()
    expect(fs.writeFile).toHaveBeenCalled()
    expect(exec).not.toHaveBeenCalledWith('git', expect.anything())
    expect(result).toBe('')
  })

  it('returns empty string if no changes to commit', async () => {
    exec.mockImplementation(async (cmd, args) => {
      if (cmd === 'git' && (args?.[0] ?? '') === 'commit')
        throw new Error('No changes to commit')
      if (cmd === 'git' && (args?.[0] ?? '') === 'rev-parse')
        throw new Error('No SHA')
      return 0
    })
    const result = await updateGitOps()
    expect(result).toBe('')
  })

  it('returns empty string if push fails', async () => {
    exec.mockImplementation(async (cmd, args) => {
      if (cmd === 'git' && (args?.[0] ?? '') === 'push')
        throw new Error('Push failed')
      return 0
    })
    const result = await updateGitOps()
    expect(result).toBe('')
  })

  it('creates branch if checkout fails', async () => {
    let checkoutCalls = 0
    exec.mockImplementation(async (cmd, args, opts) => {
      if (cmd === 'git' && args?.[0] === 'checkout') {
        checkoutCalls++
        if (
          checkoutCalls === 1 &&
          args.length === 2 &&
          args[1] === 'feature-branch'
        ) {
          // Simulate branch does not exist: throw on first checkout
          throw new Error('Branch does not exist')
        }
        // Second call (with -b) should succeed
      }
      if (cmd === 'git' && args?.[0] === 'rev-parse') {
        opts?.listeners?.stdout?.(Buffer.from('commit-sha1'))
      }
      return 0
    })
    const result = await updateGitOps()
    // First checkout should be attempted and fail
    expect(exec).toHaveBeenCalledWith('git', ['checkout', 'feature-branch'])
    // Second checkout should create the branch
    expect(exec).toHaveBeenCalledWith('git', [
      'checkout',
      '-b',
      'feature-branch'
    ])
    expect(result).toBe('commit-sha1')
  })
})
