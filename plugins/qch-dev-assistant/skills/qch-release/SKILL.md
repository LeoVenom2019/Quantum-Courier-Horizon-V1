---
name: qch-release
description: Prepare QCH changes for GitHub or handoff. Use when Codex needs to review the worktree, protect ignored/private files, run lint/build checks, summarize changes, stage, commit, push, open a PR, or verify that QCH is ready to share.
---

# QCH Release

Use this skill before sending QCH changes to GitHub or making a final handoff after a meaningful change.

## Checks

1. Run `git status --short` and identify files changed by the current task versus pre-existing user changes.
2. Check `.gitignore` and avoid committing local secrets, logs, `.next`, `node_modules`, and the folder named `Essa pasta deve ser ignorada ao enviar para GITHUB`.
3. Run `npm run lint` for code changes.
4. Run `npm run build` for changes touching app routes, shared components, state, config, or TypeScript types.
5. For visual changes, use `qch-visual-qa` before final handoff.

## GitHub Handoff

- Keep commits focused and mention test results in the final response.
- Use the GitHub app/skill when opening PRs or addressing PR feedback.
- Never revert unrelated user changes. Work with them or leave them alone.

Read `references/release-checklist.md` for a concise pre-PR checklist.
