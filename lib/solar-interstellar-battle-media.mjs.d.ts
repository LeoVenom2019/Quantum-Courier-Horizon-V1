export type SolarInterstellarRouteTier = 'Solar' | 'Interstellar';
export type SolarInterstellarBattleOutcome = 'victory' | 'defeat';

export const SOLAR_INTERSTELLAR_BATTLE_MEDIA: Readonly<{
  Solar: Readonly<{
    battleThemes: readonly [string, string];
    victoryTheme: string;
  }>;
  Interstellar: Readonly<{
    battleThemes: readonly [string, string];
    victoryTheme: string;
  }>;
  defeatTheme: string;
}>;

export function isSolarInterstellarManualBattle(
  routeTier: string,
  deliveryId?: string | null,
): boolean;

export function pickManualBattleTheme(
  routeTier: string,
  randomValue?: number,
): string | null;

export function getManualBattleResultAudio(
  routeTier: string,
  outcome: SolarInterstellarBattleOutcome,
): string | null;
