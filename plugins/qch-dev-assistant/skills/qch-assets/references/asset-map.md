# QCH Asset Map

## Major Folders

- `public/images/ships`: ship still images and concepts.
- `public/videos/ships`: ship animation loops.
- `public/videos/hangar`: hangar previews for named ships.
- `public/images/battle`: shared battle enemies, player, and environment images.
- `public/images/battle/void` and `public/assets/rota3/void`: Void battle enemies, bosses, backgrounds, and route assets.
- `public/images/traffic`: ambient traffic sprites.
- `public/images/bobby_blue` and `public/videos/bobby_blue`: Bobby Blue character/media.
- `public/audio/themes`: route and arcade music.
- `public/audio/sfx`: global and route-specific sound effects.
- `public/mini-games/<slug>`: standalone mini-game HTML/CSS/JS.
- `public/assets/games`: per-game supporting assets or notes.

## Wiring Pattern

1. Place the asset in the closest existing folder family.
2. Search for sibling filenames to find the catalog or component that references them.
3. Add the reference using a root-relative path like `/images/ships/name.webp`.
4. For audio, prefer existing music/SFX data and hooks.
5. For videos, confirm extension and codec are supported by the browser target.

## Naming Guidance

- New names should be lowercase kebab-case unless the existing family uses underscores.
- Do not rename existing media casually; many references may be string literals.
- Keep route-specific boss/media names near the route folder rather than in generic folders.
