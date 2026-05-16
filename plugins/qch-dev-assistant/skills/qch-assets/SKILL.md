---
name: qch-assets
description: Inventory, validate, and wire QCH media assets. Use when Codex needs to add or audit images, WebP sprites, WebM/MP4 videos, OGG audio, battle assets, ship media, mini-game assets, or public asset references in the QCH project.
---

# QCH Assets

Use this skill for any task involving `public/` media or asset references in QCH.

## Asset Rules

- Keep user-facing media under `public/` so Next.js can serve it by root-relative path.
- Preserve existing folder language and naming where a feature already has a convention.
- Prefer kebab-case for new public files unless matching an existing family that uses underscores.
- When adding a ship, check both `public/images/ships` and `public/videos/ships` or `public/videos/hangar` depending on the screen.
- When adding battle content, check route-specific folders under `public/assets/rota*` and generic battle folders under `public/images/battle`.
- When adding audio, wire it through existing hooks/data rather than playing raw elements directly.

Read `references/asset-map.md` when the task needs a folder-by-folder guide.

## Workflow

1. Run `scripts/inventory_assets.py <repo-root>` to summarize asset counts and largest files.
2. Search references with `rg "asset-name|folder-name" app components lib public`.
3. Update data/config references before UI code when the asset belongs to a declared catalog.
4. Verify path casing exactly. Windows may hide casing mistakes that fail elsewhere.
5. For visual changes, use `qch-visual-qa` after wiring assets.

## Useful Script

`scripts/inventory_assets.py` prints counts by extension and top large media files.
