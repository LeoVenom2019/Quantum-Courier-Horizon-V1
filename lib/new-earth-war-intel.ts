export const NEW_EARTH_WAR_INTEL_STORAGE_KEY = 'new_earth_war_intel';

export type NewEarthWarIntelKind = 'helicopter' | 'tank';

export type NewEarthWarIntel = {
  id: string;
  kind: NewEarthWarIntelKind;
  index: number;
  scrollSrc: string;
  title: Record<'pt' | 'en', string>;
  captain: string;
  fleet: Record<'pt' | 'en', string>;
  maneuver: Record<'pt' | 'en', string>;
  estimatedCombat: Record<'pt' | 'en', string>;
  summary: Record<'pt' | 'en', string>;
};

export type NewEarthWarIntelCollection = Record<string, NewEarthWarIntel & {
  foundAt: number;
  siteId?: string;
  colonyId?: string;
}>;

export const NEW_EARTH_WAR_INTEL_SCROLLS = [
  '/assets/rota4/war_informations/war_inf_1.webp',
  '/assets/rota4/war_informations/war_inf_2.webp',
  '/assets/rota4/war_informations/war_inf_3.webp',
  '/assets/rota4/war_informations/war_inf_4.webp',
];

const getDefaultScrollSrc = (index: number) => NEW_EARTH_WAR_INTEL_SCROLLS[(index - 1) % NEW_EARTH_WAR_INTEL_SCROLLS.length];

const HELICOPTER_CAPTAINS = [
  'Kael Voss', 'Mira Thorne', 'Orin Vale', 'Sable Korr', 'Tavian Rusk',
  'Nyx Calder', 'Ilya Draven', 'Vera Solen', 'Dax Morran', 'Selene Ark',
  'Ronan Kade', 'Astra Noll', 'Ciro Vance', 'Leona Stray', 'Marek Haze',
  'Elian Crowe', 'Nadia Vey', 'Tor Halden', 'Kara Myles', 'Bastian Rho',
];

const TANK_CAPTAINS = [
  'Brant Merek', 'Helga Vorn', 'Cassian Rell', 'Otto Greif', 'Nero Stahl',
  'Viktor Alar', 'Soren Drax', 'Maia Krupp', 'Galen Rook', 'Anika Voss',
  'Dorian Kreel', 'Petra Kain', 'Ulric Sato', 'Rhea Falk', 'Magnus Holt',
  'Tessa Brigg', 'Korin Wulf', 'Lena Harth', 'Adrian Knox', 'Iris Volke',
];

const createHelicopterIntel = (index: number): NewEarthWarIntel => {
  const serial = String(index).padStart(2, '0');
  const captain = HELICOPTER_CAPTAINS[index - 1];
  return {
    id: `helicopter-${serial}`,
    kind: 'helicopter',
    index,
    scrollSrc: getDefaultScrollSrc(index),
    title: {
      pt: `Dossiê Aéreo ${serial}`,
      en: `Air Dossier ${serial}`,
    },
    captain,
    fleet: {
      pt: `Esquadrilha de rotores A-${index + 3}, drones de escolta e duas janelas de míssil guiado prontas para abertura.`,
      en: `A-${index + 3} rotor squadron, escort drones, and two guided missile windows ready to open.`,
    },
    maneuver: {
      pt: index % 3 === 0
        ? 'Entrar em altitude baixa, abrir em leque e recuar pela lateral para puxar fogo antiaéreo.'
        : index % 3 === 1
          ? 'Avançar pelo centro com drones à frente e mergulhar contra o ponto de comando.'
          : 'Simular retirada pela direita, retornar em arco e atingir depósitos de suprimento.',
      en: index % 3 === 0
        ? 'Enter at low altitude, spread into a fan, and retreat laterally to draw anti-air fire.'
        : index % 3 === 1
          ? 'Push through the center with drones forward, then dive against the command point.'
          : 'Fake a retreat to the right, arc back, and strike supply depots.',
    },
    estimatedCombat: {
      pt: `${6 + (index % 5)} a ${10 + (index % 6)} minutos em clima instável.`,
      en: `${6 + (index % 5)} to ${10 + (index % 6)} minutes in unstable weather.`,
    },
    summary: {
      pt: `${captain} ordena reconhecimento armado antes do golpe principal. Separar drones do Aether, marcar hélices críticas e fechar formação quando a defesa abrir corredores de tiro.`,
      en: `${captain} orders armed reconnaissance before the main strike. Split drones away from Aether, mark critical rotors, and close formation when defenses open firing corridors.`,
    },
  };
};

const createTankIntel = (index: number): NewEarthWarIntel => {
  const serial = String(index).padStart(2, '0');
  const captain = TANK_CAPTAINS[index - 1];
  return {
    id: `tank-${serial}`,
    kind: 'tank',
    index,
    scrollSrc: getDefaultScrollSrc(index + 2),
    title: {
      pt: `Dossiê Blindado ${serial}`,
      en: `Armored Dossier ${serial}`,
    },
    captain,
    fleet: {
      pt: `Coluna blindada T-${index + 4}, peças de cerco, tanques elite de cano duplo e apoio naval em prontidão.`,
      en: `T-${index + 4} armored column, siege pieces, twin-barrel elite tanks, and naval support on standby.`,
    },
    maneuver: {
      pt: index % 3 === 0
        ? 'Avançar pelas ruínas laterais, travar o corredor e cruzar fogo contra veículos leves.'
        : index % 3 === 1
          ? 'Manter linha lenta de pressão, disparar elites em dupla e abrir brecha ao comando.'
          : 'Lançar fumaça, simular recuo e retornar em pinça sobre depósitos de defesa.',
      en: index % 3 === 0
        ? 'Advance through lateral ruins, lock the corridor, and crossfire against light vehicles.'
        : index % 3 === 1
          ? 'Hold a slow pressure line, fire elite twins, and open a breach for command armor.'
          : 'Launch smoke, fake retreat, and return in a pincer over defense depots.',
    },
    estimatedCombat: {
      pt: `${9 + (index % 6)} a ${16 + (index % 5)} minutos com terreno quebrado.`,
      en: `${9 + (index % 6)} to ${16 + (index % 5)} minutes over broken terrain.`,
    },
    summary: {
      pt: `${captain} mantém doutrina de desgaste: preservar o boss até saturar os flancos. Elites devem abrir caminho, capturar o eixo de comando e esmagar a rota defensiva.`,
      en: `${captain} keeps an attrition doctrine: preserve the boss until the flanks are saturated. Elites must open the way, seize the command axis, and crush the defensive route.`,
    },
  };
};

export const NEW_EARTH_HELICOPTER_WAR_INTEL = Array.from({ length: 20 }, (_, index) => createHelicopterIntel(index + 1));
export const NEW_EARTH_TANK_WAR_INTEL = Array.from({ length: 20 }, (_, index) => createTankIntel(index + 1));

export const NEW_EARTH_WAR_INTEL_CATALOG = [
  ...NEW_EARTH_HELICOPTER_WAR_INTEL,
  ...NEW_EARTH_TANK_WAR_INTEL,
];

export const normalizeNewEarthWarIntelCollection = (value: unknown): NewEarthWarIntelCollection => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};

  const normalized: NewEarthWarIntelCollection = {};
  Object.entries(value as Record<string, any>).forEach(([key, item]) => {
    const intel = item && typeof item === 'object'
      ? NEW_EARTH_WAR_INTEL_CATALOG.find(entry => entry.id === item.id || entry.id === key)
      : null;

    if (!intel) return;

    normalized[intel.id] = {
      ...intel,
      scrollSrc: typeof item.scrollSrc === 'string' && item.scrollSrc ? item.scrollSrc : intel.scrollSrc,
      foundAt: Math.max(0, Number(item.foundAt) || 0),
      siteId: typeof item.siteId === 'string' ? item.siteId : undefined,
      colonyId: typeof item.colonyId === 'string' ? item.colonyId : undefined,
    };
  });

  return normalized;
};

export const getNextNewEarthWarIntelDrop = (
  collection: NewEarthWarIntelCollection,
  kind: NewEarthWarIntelKind,
  siteId?: string
) => {
  const source = kind === 'helicopter'
    ? siteId === 'zona-glacial'
      ? NEW_EARTH_HELICOPTER_WAR_INTEL.slice(0, 10)
      : siteId === 'continente-esquecido'
        ? NEW_EARTH_HELICOPTER_WAR_INTEL.slice(10, 20)
        : NEW_EARTH_HELICOPTER_WAR_INTEL
    : NEW_EARTH_TANK_WAR_INTEL;

  return source.find(intel => !collection[intel.id]) || null;
};
