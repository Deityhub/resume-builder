# Branch Protection Rules

This document outlines the recommended branch protection rules for the repository.

## Main Branch Protection

To enable these rules, go to: **Settings → Branches → Add rule**

### Required Settings for `main` branch:

#### 1. Require a pull request before merging
- ✅ **Require approvals**: 1 (or more for team projects)
- ✅ **Dismiss stale pull request approvals when new commits are pushed**
- ✅ **Require review from Code Owners** (optional)

#### 2. Require status checks to pass before merging
- ✅ **Require branches to be up to date before merging**

**Required status checks:**
- `Lint & Format Check`
- `Type Check`
- `Unit Tests`
- `E2E Tests`
- `Build Check`
- `All Checks Passed`

#### 3. Require conversation resolution before merging
- ✅ **Require conversation resolution before merging**

#### 4. Require linear history (optional)
- ✅ **Require linear history** (prevents merge commits)

#### 5. Do not allow bypassing the above settings
- ✅ **Do not allow bypassing the above settings**
- ⚠️ **Include administrators** (recommended for team projects)

#### 6. Restrict who can push to matching branches (optional)
- Configure if you want to restrict direct pushes

#### 7. Allow force pushes
- ❌ **Allow force pushes** (disabled for safety)

#### 8. Allow deletions
- ❌ **Allow deletions** (disabled for safety)

## Develop Branch Protection (Optional)

For projects using a `develop` branch, apply similar rules with potentially relaxed requirements:

- **Require approvals**: 1
- **Required status checks**: Same as main
- **Allow force pushes**: ❌ Disabled
- **Allow deletions**: ❌ Disabled

## How to Set Up

1. Go to your repository on GitHub
2. Click **Settings** → **Branches**
3. Click **Add rule** or **Add branch protection rule**
4. Enter branch name pattern: `main`
5. Configure the settings as outlined above
6. Click **Create** or **Save changes**

## Automated Checks

The following checks run automatically on every PR:

### CI Workflow (`ci.yml`)
- **Lint & Format Check**: Ensures code follows style guidelines
- **Type Check**: Validates TypeScript types
- **Unit Tests**: Runs all unit tests (22+ tests)
- **E2E Tests**: Runs end-to-end tests (17+ tests)
- **Build Check**: Verifies the project builds successfully

### PR Checks Workflow (`pr-checks.yml`)
- **PR Information**: Displays PR details
- **Auto Label**: Automatically labels PRs based on changed files
- **Size Label**: Labels PR size (xs, s, m, l, xl)
- **Test Coverage**: Comments coverage report on PR

## Merge Strategies

Recommended merge strategies:

1. **Squash and merge** (recommended for clean history)
   - Combines all commits into one
   - Keeps main branch history clean

2. **Rebase and merge** (for linear history)
   - Maintains individual commits
   - Creates linear history

3. **Create a merge commit** (traditional)
   - Preserves all commits
   - Shows merge points

## Status Badges

Add these badges to your README.md:

```markdown
![CI](https://github.com/YOUR_USERNAME/resume-builder/workflows/CI/badge.svg)
![PR Checks](https://github.com/YOUR_USERNAME/resume-builder/workflows/PR%20Checks/badge.svg)
```

## Notes

- All checks must pass before a PR can be merged
- PRs automatically get labeled based on changed files
- Test coverage reports are posted as PR comments
- Failed tests upload artifacts for debugging
- Build artifacts are stored for 7 days
