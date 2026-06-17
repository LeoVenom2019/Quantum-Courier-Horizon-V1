---
name: qch-balance
description: Analyze QCH economy, combat, mining, upgrades, missions, route progression, and reward tuning. Use when the project workflow needs to review or change gameplay numbers in reducers, constants, game data, missions, ship stats, enemy stats, costs, production, cooldowns, or progression curves.
---

# QCH Balance

Use this skill before changing gameplay numbers. The priority is preserving a readable progression curve and avoiding accidental runaway values.

## Likely Files

- Shared constants and game data: `lib/game-constants.ts`, `lib/game-data.ts`.
- State logic: `lib/game-state/slices/*Reducer.ts`, `lib/game-state/rootReducer.ts`, `lib/game-state/types.ts`.
- Mission and progression UI: `components/dashboard/MissionsTab.tsx`, `SkillMap.tsx`, `UpgradesTab.tsx`, `MiningTab.tsx`.
- Battle surfaces: `components/VoidBattleArena.tsx`, `components/dashboard/BattleOverlay.tsx`, `components/dashboard/void/*`.

## Workflow

1. Locate the numeric source of truth before editing UI labels.
2. Compare costs, rewards, damage, HP, cooldowns, and unlock thresholds across adjacent tiers.
3. Avoid single-step jumps that are not explained by a new mechanic, boss, route, or milestone.
4. Keep derived display values consistent with reducer behavior.
5. Run `scripts/extract_numbers.py <repo-root>` to list numeric-heavy files before a balance review.

Read `references/balance-guidelines.md` for what to inspect by system.
