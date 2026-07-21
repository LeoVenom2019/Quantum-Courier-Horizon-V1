export const NEW_LAND_BATTLE_MUSIC: Readonly<{
  themes: readonly string[];
  searchDefensePreferenceKey: string;
  directPreferenceKey: string;
}>;

export function pickNewLandBattleTheme(randomValue?: number): string;
