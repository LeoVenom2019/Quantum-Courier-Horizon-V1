import type { Battle } from '@/lib/game-state/types';

export interface BattleSpriteSheet {
  image: string;
  frameWidth: number;
  frameHeight: number;
  columns: number;
  rows: number;
  frameCount: number;
  fps?: number;
  directional?: boolean;
  scale?: number;
}

export type Cap12EnemyRarity = 'common' | 'alien' | 'elite' | 'boss';

const baseSheet = (
  image: string,
  frameWidth: number,
  frameHeight: number,
  scale = 1,
): BattleSpriteSheet => ({
  image,
  frameWidth,
  frameHeight,
  columns: 8,
  rows: 4,
  frameCount: 32,
  fps: 12,
  scale,
});

export const CAP12_PLAYER_SPRITES = {
  standard: baseSheet('/images/battle/standard_ship/sheet_01_motion_2x_spritesheet_8x4.webp', 603, 400, 1),
  skyring: {
    ...baseSheet('/images/battle/skyring/sheet_01_motion_2x_spritesheet_8x4.webp', 742, 320, 1.2),
    directional: true,
  },
} as const satisfies Record<string, BattleSpriteSheet>;

export const CAP12_ENEMY_SPRITES = {
  common: baseSheet('/images/battle/enemy_comum/enemy_comum.webp', 585, 364, 1),
  alien: [
    baseSheet('/images/battle/enemy_alien/enemy_alien_01.webp', 546, 384, 1),
    baseSheet('/images/battle/enemy_alien/enemy_alien_02.webp', 559, 461, 1),
  ],
  elite: baseSheet('/images/battle/enemy_elite/enemy_elite.webp', 681, 460, 1.15),
  boss: baseSheet('/images/battle/enemy_boss/enemy_boss.webp', 651, 507, 1.7),
} as const;

export const getCap12PlayerSprite = (battleLevel: number): BattleSpriteSheet => (
  battleLevel >= 25 ? CAP12_PLAYER_SPRITES.skyring : CAP12_PLAYER_SPRITES.standard
);

export const selectCap12EnemySprite = (
  rarity: Cap12EnemyRarity,
  random = Math.random,
): BattleSpriteSheet => {
  if (rarity === 'alien') {
    const variants = CAP12_ENEMY_SPRITES.alien;
    return variants[Math.floor(random() * variants.length)] || variants[0];
  }

  return CAP12_ENEMY_SPRITES[rarity];
};

export const rollCap12EnemyRarity = ({
  battleLevel,
  enemyTier,
  routeTier,
  bossCooldownReady,
  random = Math.random,
}: {
  battleLevel: number;
  enemyTier: number;
  routeTier: string;
  bossCooldownReady: boolean;
  random?: () => number;
}): Cap12EnemyRarity => {
  let bossChance = 0.06 + (battleLevel >= 15 ? 0.04 : 0);
  if (battleLevel >= 45 && routeTier === 'Interstellar') bossChance += 0.18;

  if (bossCooldownReady && random() < bossChance) return 'boss';

  const levelFactor = Math.min(1, Math.max(0, (enemyTier - 1) / 19));
  const eliteWeight = Math.max(0.03, Math.min(0.24, 0.02 + levelFactor * 0.22));
  const alienWeight = Math.max(0.24, Math.min(0.46, 0.28 + levelFactor * 0.18));
  const commonWeight = Math.max(0.30, 1 - eliteWeight - alienWeight);
  const total = commonWeight + alienWeight + eliteWeight;
  const roll = random() * total;

  if (roll < eliteWeight) return 'elite';
  if (roll < eliteWeight + alienWeight) return 'alien';
  return 'common';
};

export const getEnemyTypeForRarity = (rarity: Cap12EnemyRarity): Battle['enemyType'] => {
  if (rarity === 'boss') return 'Boss';
  if (rarity === 'elite') return 'Elite';
  if (rarity === 'alien') return 'Alien';
  return 'Pirate';
};
