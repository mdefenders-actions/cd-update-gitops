import * as fs from 'fs/promises'
import * as path from 'path'
import * as core from '@actions/core'
import { exec } from '@actions/exec'

/**
 * Updates a GitOps manifest file (values.yaml) with provided deployment values.
 * Ensures the file and its parent directories exist, then writes the manifest.
 * Commits and pushes the change into the specified branch, creating it if it doesn't exist.
 * Returns the commit SHA1 or an empty string if no changes to push.
 *
 * Manifest format:
 * image: <image>
 * tag: <newTag>
 * app: <app>
 * replicas: <replicas>
 *
 * @returns {Promise<string>} The commit SHA1 after the update, or an empty string if no changes to push
 */
export async function updateGitOps(): Promise<string> {
  // Retrieve all inputs
  const gitOpsBrnach = core.getInput('gitops-branch', { required: true })
  const newTag = core.getInput('new-tag', { required: true })
  const gitopsFile = core.getInput('gitops-file', { required: true })
  const image = core.getInput('image', { required: true })
  const app = core.getInput('app', { required: true })
  const replicas = core.getInput('replicas', { required: false })
  const dryRun = core.getBooleanInput('dry-run', { required: false })

  // Ensure gitopsFile and its parent folders exist
  const dir = path.dirname(gitopsFile)
  await fs.mkdir(dir, { recursive: true })

  // Prepare manifest content
  const manifestContent =
    `image: ${image}\n` +
    `tag: ${newTag}\n` +
    `app: ${app}\n` +
    `replicas: ${replicas}\n`

  // Write manifest to file (overwrite if exists)
  await fs.writeFile(gitopsFile, manifestContent)
  core.info(`Manifest updated: ${gitopsFile}`)

  // If dry-run, skip all git operations and return empty string
  if (dryRun) {
    core.info('Dry-run mode enabled: skipping git operations.')
    return ''
  }

  // Git config
  await exec('git', ['config', '--global', 'user.name', 'github-actions[bot]'])
  await exec('git', [
    'config',
    '--global',
    'user.email',
    'github-actions[bot]@users.noreply.github.com'
  ])

  // Checkout or create the target branch
  try {
    await exec('git', ['checkout', gitOpsBrnach])
    core.info(`Checked out branch: ${gitOpsBrnach}`)
  } catch {
    core.info(`Branch ${gitOpsBrnach} does not exist, creating it.`)
    await exec('git', ['checkout', '-b', gitOpsBrnach])
  }

  // Add, commit, and push changes
  await exec('git', ['add', gitopsFile])
  let committed = true
  try {
    await exec('git', [
      'commit',
      '-m',
      `github-actions[bot] ${gitopsFile} updated with image version ${image}:${newTag}`
    ])
  } catch {
    core.info('No changes to commit')
    committed = false
  }
  try {
    await exec('git', ['push', '-u', 'origin', gitOpsBrnach])
  } catch {
    core.info('No changes to push or push failed')
    committed = false
  }
  core.info(`${gitopsFile} committed and pushed to branch ${gitOpsBrnach}`)

  // Get the current commit SHA1 only if a commit was made and pushed
  if (committed) {
    let sha = ''
    await exec('git', ['rev-parse', 'HEAD'], {
      listeners: {
        stdout: (data: Buffer) => {
          sha += data.toString().trim()
        }
      }
    })
    core.info(`Commit SHA1: ${sha}`)
    return sha
  } else {
    return ''
  }
}
