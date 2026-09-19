# Security policy

## Reporting a vulnerability

Please report security issues privately through
[GitHub's private vulnerability reporting](https://github.com/bugsum/planit/security/advisories/new),
not in a public issue or pull request.

Include what you found, how to reproduce it, and the impact you expect. You'll
get a reply within a few days, and credit in the release notes if you'd like.

## Scope

Plan It runs entirely in the browser and stores boards in `localStorage`; there
is no server or account system. Relevant reports include, for example:

- script injection through board, card or label content, markdown notes or
  imported JSON files
- anything that lets one site or tab read or change another origin's boards
- supply-chain issues in dependencies or the release workflow

Only the latest release is supported.
