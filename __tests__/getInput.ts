export function getInput(key: string): string {
  if (key === 'gitops-branch') return 'feature-branch'
  if (key === 'new-tag') return 'v1.2.3'
  if (key === 'gitops-file') return 'deploy/environments/dev/values.yaml'
  if (key === 'image') return 'repo/image'
  if (key === 'app') return 'my-app'
  if (key === 'replicas') return '2'
  return ''
}
