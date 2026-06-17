---
name: qch-codebase
description: Understand and modify the QCH Next.js game codebase. Use when the project workflow needs to locate feature ownership, change React components, reducers, game state, translations, mini-games, routes, audio hooks, dashboard tabs, or project conventions inside D:\PROJETOS\QCH.
---

# QCH Codebase

Use this skill before making non-trivial QCH code changes. Start by reading the local files, then use the map below to avoid broad edits.

## Quick Map

- App shell: `app/layout.tsx`, `app/page.tsx`, `app/globals.css`.
- Main game/dashboard components: `components/GameDashboard.tsx`, `components/dashboard/*`.
- Void battle surface: `components/VoidBattleArena.tsx`, `components/dashboard/void/*`.
- Game state: `lib/game-state/index.tsx`, `rootReducer.ts`, `types.ts`, `selectors.ts`, and `lib/game-state/slices/*`.
- Static config/data: `lib/game-data.ts`, `lib/game-constants.ts`, `lib/mini-games-config.ts`, `lib/music-data.ts`.
- Persistence: `lib/save-manager.ts`, `lib/game-storage.ts`, `app/api/save/route.ts`, `app/api/settings/route.ts`, `app/api/logs/route.ts`.
- Audio: `hooks/useSoundMaster.ts`, `hooks/useSFX.ts`, `hooks/useJukebox.ts`, `hooks/useGameAudio.ts`.
- Internationalization: `lib/i18n.ts`, `lib/i18n/dashboard-translations.ts`.
- Browser mini-games: `public/mini-games/<game>/index.html`, `script.js`, `style.css`.
- Assets: `public/images`, `public/videos`, `public/audio`, `public/assets`.

For a broader architecture overview, read `references/project-map.md`.

## Workflow

1. Run `rg --files` and inspect the likely owning files before editing.
2. Prefer existing state/action patterns in `lib/game-state` over adding isolated component state for durable game systems.
3. Keep feature data in `lib/*data*` or `lib/*constants*` when the surrounding code already does.
4. Update translations when adding user-facing dashboard text.
5. Verify with `npm run lint` and `npm run build` when the change touches shared state, app routes, or TypeScript contracts.

## Useful Script

Run `scripts/scan_project.py <repo-root>` to print a compact project inventory and likely hotspots.
