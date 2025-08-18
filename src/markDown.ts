import * as core from '@actions/core'
import * as github from '@actions/github'

export async function generateMarkDown(commitID: string): Promise<string> {
  if (commitID === '') {
    return `### No changes pushed to GitOps manifest.\n\n`
  }
  const gitOpsBrnach = core.getInput('gitops-branch', { required: true })
  const newTag = core.getInput('new-tag', { required: true })
  const gitopsFile = core.getInput('gitops-file', { required: true })
  const image = core.getInput('image', { required: true })
  const replicas = core.getInput('replicas', { required: false })
  const fullRepoName = `${github.context.repo.owner}/${github.context.repo.repo}`

  let markDown = `### CD Action:\n\n`
  markDown += `Pushed image ${image}:${newTag} to ${gitopsFile} on ${gitOpsBrnach} with ${replicas}\n\n`
  markDown += `[View Commit](https://github.com/${fullRepoName}/commit/${commitID})\n\n`
  return markDown
}
