# QCH Project Map

QCH is a Next.js app with a game dashboard, persistent state, browser mini-games, and a large public media library.

## Primary Areas

- `app/`: Next.js routes, API handlers, loading/error/not-found boundaries, global CSS.
- `components/`: top-level game surfaces, narrative, audio modals, arcade cards, dashboard shell.
- `components/dashboard/`: operational dashboard tabs and route/battle-specific panels.
- `components/dashboard/void/`: Void route tabs and battle/map/earth surfaces.
- `hooks/`: audio and responsive helpers.
- `lib/`: data, constants, persistence, i18n, utilities.
- `lib/game-state/`: reducer-driven game state, selectors, provider, slices.
- `public/`: images, videos, audio, mini-games, route assets.
- `tests/`: standalone HTML demos/previews for specific effects.

## Common Change Routes

- Add dashboard UI: start in `components/dashboard`, then check `GameDashboard.tsx` and translations.
- Add persistent gameplay behavior: start in `lib/game-state/types.ts`, the relevant slice reducer, selectors, and persistence helpers.
- Add static catalog item: start in `lib/game-data.ts`, `lib/game-constants.ts`, `lib/mini-games-config.ts`, or `lib/music-data.ts`.
- Add route/battle media: start in `public/assets/rota*`, then update the component/data path that references it.
- Add audio: start in `public/audio`, then update `lib/music-data.ts` or the appropriate audio hook/data path.
- Add mini-game: create/update `public/mini-games/<slug>`, then register it through mini-game config and any arcade UI.

## Safety Notes

- Treat `.env.local`, `.next`, `node_modules`, logs, and the explicitly ignored Portuguese folder as local-only.
- Watch for path casing. Assets may work on Windows while failing on case-sensitive hosts.
- Keep UI changes compatible with both desktop and mobile; dashboard panels are dense.
