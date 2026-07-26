const BATTLE_BACKGROUND_BASE = '/assets/rota4/battles/backgrounds';

const createBackground = (folder, name) => Object.freeze({
  id: name,
  image: `${BATTLE_BACKGROUND_BASE}/${folder}/${name}.webp`,
  video: `${BATTLE_BACKGROUND_BASE}/${folder}/${name}.mp4`,
});

export const NEW_EARTH_BATTLE_BACKGROUNDS = Object.freeze([
  createBackground('day', 'rt4_background_day'),
  createBackground('night', 'rt4_background_night'),
  createBackground('winter', 'rt4_background_winter'),
  createBackground('multiple', 'rt4_background_day_2'),
  createBackground('multiple', 'rt4_background_day_3'),
  createBackground('multiple', 'rt4_background_day_4'),
  createBackground('multiple', 'rt4_background_night_2'),
  createBackground('multiple', 'rt4_background_night_3'),
  createBackground('multiple', 'rt4_background_night_4'),
  createBackground('multiple', 'rt4_background_night_5'),
  createBackground('multiple', 'rt4_background_winter_2'),
]);

export const pickNewEarthBattleBackground = (random = Math.random) => {
  const roll = Math.max(0, Math.min(0.999999, Number(random()) || 0));
  return NEW_EARTH_BATTLE_BACKGROUNDS[
    Math.floor(roll * NEW_EARTH_BATTLE_BACKGROUNDS.length)
  ];
};
