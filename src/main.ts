import * as core from '@actions/core'
import { generateMarkDown } from './markDown.js'
import { updateGitOps } from './updateGitOps.js'

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    core.startGroup('Getting Image tags')
    const commitID = await updateGitOps()
    core.endGroup()
    core.startGroup('Generating Markdown Report')
    const markDownReport = await generateMarkDown(commitID)
    await core.summary.addRaw(markDownReport, true).write()
    core.setOutput('report', markDownReport)
    core.setOutput('commit-id', commitID)
    core.endGroup()
  } catch (error: unknown) {
    if (error instanceof Error) {
      core.error(`Action failed with error: ${error.message}`)
      core.setFailed(error.message)
    } else {
      core.error('Action failed with an unknown error')
      core.setFailed('Unknown error occurred')
    }
  }
}
