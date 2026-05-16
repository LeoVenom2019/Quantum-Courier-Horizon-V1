# QCH Release Checklist

- Review `git status --short`.
- Confirm no local-only secrets or generated folders are staged.
- Run `npm run lint` after TypeScript/React changes.
- Run `npm run build` after route, state, config, or shared component changes.
- Use visual QA after visible UI/media changes.
- Summarize changed files by feature area.
- Mention failed or skipped checks explicitly in the final response.
