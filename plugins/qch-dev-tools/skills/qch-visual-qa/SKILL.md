---
name: qch-visual-qa
description: Verify QCH screens, layouts, media, and interactions in a local browser. Use after frontend, styling, asset, dashboard, battle, mini-game, responsive layout, or animation changes in the QCH Next.js app.
---

# QCH Visual QA

Use this skill after visible changes. The goal is to catch blank screens, broken media, overlapping UI, unreadable text, and obvious interaction failures.

## Local App

- Start with `npm run dev` from the repo root when no dev server is already running.
- Default local URL is `http://localhost:3000`; if occupied, use the Next.js fallback port shown in the terminal.
- Use the Browser plugin/in-app browser for screenshots and interaction checks when available.

## Checklist

1. Open the first screen and wait for media to load.
2. Check desktop and mobile widths for text overlap, clipped buttons, and broken fixed-size panels.
3. Inspect changed routes/tabs/components directly.
4. For videos/images, confirm the visible asset is the intended one and is not blank or poster-only by mistake.
5. For battle or mini-games, click through the changed control path and watch for runtime errors.
6. If a console/runtime error appears, fix it before final response.

Read `references/visual-checklist.md` for task-specific checks.
