# Repository settings

The workflows and configs in this repo only protect `master` once these GitHub
settings are on. They can't be set from code, so apply them once by hand at
https://github.com/bugsum/planit/settings.

## 1. Branch ruleset for `master`

**Settings → Rules → Rulesets → New ruleset → Import a ruleset**, and pick
[`.github/rulesets/master.json`](../.github/rulesets/master.json).

It enforces, on the default branch:

- no direct pushes, force pushes or deletion
- pull requests only, squash merge only, linear history
- one approving review from the code owner; new pushes dismiss old approvals;
  all conversations resolved
- required checks **Quality** and **PR hygiene**, on an up-to-date branch

Repository admins can merge their own PRs without an approval ("bypass: for
pull requests only"), but still can't push to `master` directly.

The status checks only appear in the picker after each workflow has run once;
the imported ruleset already names them.

## 2. Pull requests

**Settings → General → Pull Requests**

- Allow squash merging only (untick merge commits and rebase merging)
- Default squash commit message: **Pull request title and description**
- Always suggest updating pull request branches: on
- Automatically delete head branches: on

## 3. Actions

**Settings → Actions → General**

- Fork pull request workflows from outside collaborators: **Require approval
  for all outside collaborators** (stops drive-by PRs from running CI)
- Workflow permissions: **Read repository contents and packages permissions**
  (the release and stale workflows request the extra scopes they need)

## 4. Security

**Settings → Advanced Security** (or **Code security**)

- Private vulnerability reporting: on (used by [SECURITY.md](../SECURITY.md))
- Dependabot alerts and Dependabot security updates: on
- Secret scanning and push protection: on

## 5. Moderation (optional, against spam)

**Settings → Moderation options → Interaction limits**: temporarily limit
interactions to prior contributors if the repo gets hit by spam PRs or issues.
