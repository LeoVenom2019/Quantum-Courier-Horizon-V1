export type NewEarthSurfaceWarKind = 'helicopter' | 'tank';

export type NewEarthSurfaceWarTrack = Readonly<{
  id: string;
  title: string;
  url: string;
}>;

export const NEW_EARTH_SURFACE_WAR_MUSIC: Readonly<Record<NewEarthSurfaceWarKind, readonly NewEarthSurfaceWarTrack[]>>;
export const NEW_EARTH_SURFACE_WAR_TRACKS: readonly NewEarthSurfaceWarTrack[];

export function pickNewEarthSurfaceWarTheme(
  kind: NewEarthSurfaceWarKind,
  randomValue?: number,
): NewEarthSurfaceWarTrack | null;
