# cd-update-gitops

GitHub Action to update GitOps manifests, commit and push changes to a target
branch, and generate a Markdown deployment report.

## Features

- Updates a manifest file (e.g., `values.yaml`) with deployment values (image,
  tag, app, replicas).
- Commits and pushes changes to a specified branch, creating it if it does not
  exist.
- Supports dry-run mode to preview changes without committing.
- Generates a Markdown summary with a link to the commit.
- Handles ignored files by force-adding them if necessary.

## Usage

Add to your workflow:

```yaml
- name: Update GitOps Manifest
  uses: owner/repo@v1
  with:
    gitops-branch: main
    new-tag: action-test-pr-31
    gitops-file: deploy/environments/dev/values.yaml
    environment: dev
    image: mdefenders/it-delivers-everywhere
    app: it-delivers-everywhere
    replicas: 1
    rollback: false
    dry-run: false
```

## Inputs

| Name          | Required | Default | Description                         |
| ------------- | -------- | ------- | ----------------------------------- |
| gitops-branch | true     |         | GitOps branch to update             |
| new-tag       | true     |         | Tag to deploy                       |
| gitops-file   | true     |         | GitOps manifest to update           |
| environment   | true     |         | Environment to deploy to            |
| image         | true     |         | Image to deploy                     |
| app           | true     |         | Application name                    |
| replicas      | false    | 3       | Number of replicas to deploy        |
| rollback      | true     | false   | Rollback to previous version        |
| dry-run       | true     | false   | Dry run mode, do not commit changes |

## Outputs

| Name      | Description                    |
| --------- | ------------------------------ |
| report    | Markdown deployment report     |
| commit-id | Commit ID of the GitOps commit |

## Development

- Install dependencies: `npm install`
- Run tests: `npm run test`
- Bundle TypeScript: `npm run bundle` (after changes to `src/`)
- Lint: `npm run lint`

## Notes

- If your manifest file is ignored by `.gitignore`, the action will force-add it
  to Git.
- Uses `@actions/core` for logging and error handling.
- Follows semantic versioning. Update `package.json` version for releases.

## Contributing

- Keep PRs focused and minimal.
- Ensure tests and coverage requirements are met.
- Update the readme for any changes in functionality or usage.

## License

See [LICENSE](./LICENSE).
