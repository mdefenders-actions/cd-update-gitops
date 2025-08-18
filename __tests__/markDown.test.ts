import { jest } from '@jest/globals'
import * as core from '../__fixtures__/core.js'
import { getInput } from './getInput.js'

jest.unstable_mockModule('@actions/core', () => core)
const { generateMarkDown } = await import('../src/markDown.js')

describe('generateMarkDown', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    core.getInput.mockImplementation((key) => {
      return getInput(key)
    })
  })

  it('returns markdown with commit link and details', async () => {
    process.env.GITHUB_REPOSITORY = 'owner/repo'
    const result = await generateMarkDown('commit-sha1')
    expect(result).toContain(
      '[View Commit](https://github.com/owner/repo/commit/commit-sha1)'
    )
    expect(result).toContain(
      'Pushed image repo/image:v1.2.3 to deploy/environments/dev/values.yaml on feature-branch with 2'
    )
  })

  it('returns markdown for no changes', async () => {
    const result = await generateMarkDown('')
    expect(result).toContain('No changes pushed to GitOps manifest.')
  })
})
