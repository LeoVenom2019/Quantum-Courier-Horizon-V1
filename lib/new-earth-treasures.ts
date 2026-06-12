export const NEW_EARTH_MUSEUM_STORAGE_KEY = 'new_earth_museum_treasures';

export type NewEarthTreasureCategory = 'rare_fish' | 'relic' | 'rare_ring';
export type NewEarthTreasureRarity = 'rare' | 'epic' | 'legendary';

export type NewEarthTreasure = {
  id: string;
  name: string;
  src: string;
  category: NewEarthTreasureCategory;
  rarity: NewEarthTreasureRarity;
  lore: Record<'pt' | 'en', string>;
};

export type NewEarthMuseumTreasures = Record<string, NewEarthTreasure & {
  foundAt: number;
  siteId?: string;
  colonyId?: string;
}>;

const TREASURE_RELIC_BASE = '/assets/rota4/treasures/relics';

const toDisplayName = (file: string) => file
  .replace(/\.(webp|png|jpg|jpeg)$/i, '')
  .replace(/^\d+_/, '')
  .replace(/_/g, ' ')
  .replace(/\b\w/g, char => char.toUpperCase());

const TREASURE_LORE: Record<string, Record<'pt' | 'en', string>> = {
  'rare_fishs-1_serpent_fish': {
    pt: 'Corpo longo e nervoso; desaparece entre fendas antes do sonar respirar.',
    en: 'Long and restless; it vanishes between cracks before sonar can breathe.',
  },
  'rare_fishs-2_spiky_angler_fish': {
    pt: 'Atrai presas com luz falsa e afasta curiosos com espinhos reais.',
    en: 'It lures prey with false light and repels the curious with real spines.',
  },
  'rare_fishs-3_neon_angler_fish': {
    pt: 'Seu brilho neon pulsa como uma placa perdida no fundo do oceano.',
    en: 'Its neon glow pulses like a lost sign on the ocean floor.',
  },
  'rare_fishs-4_golden_rock_fish': {
    pt: 'Fica imóvel como pedra; só o brilho dourado denuncia sua presença.',
    en: 'It sits still as stone; only its golden shine gives it away.',
  },
  'rare_fishs-5_emerald_fin_fish': {
    pt: 'Nadadeiras verdes cortam a água como lâminas de vidro antigo.',
    en: 'Green fins cut the water like blades of ancient glass.',
  },
  'rare_fishs-6_purple_angler_fish': {
    pt: 'Seu farol violeta aparece onde a luz natural jamais alcança.',
    en: 'Its violet lure appears where natural light never reaches.',
  },
  'rare_fishs-7_abyssal_eye_fish': {
    pt: 'Um olho enorme vigia o abismo, sempre parecendo já saber.',
    en: 'One huge eye watches the abyss, always seeming to already know.',
  },
  'rare_fishs-8_green_thorn_fish': {
    pt: 'Espinhos verdes fazem dele uma pequena armadilha viva.',
    en: 'Green thorns turn it into a small living trap.',
  },
  'rare_fishs-9_spiky_puffer_fish': {
    pt: 'Infla quando teme; o medo vira muralha de pontas.',
    en: 'It swells when afraid; fear becomes a wall of spikes.',
  },
  'rare_fishs-10_obsidian_flat_fish': {
    pt: 'Plano e escuro como obsidiana, desliza rente ao chão marinho.',
    en: 'Flat and dark as obsidian, it glides close to the seabed.',
  },
  'rare_fishs-11_crimson_jellyfish': {
    pt: 'Sua dança vermelha lembra um sinal de alerta suspenso na água.',
    en: 'Its red dance feels like a warning sign suspended in water.',
  },
  'rare_fishs-12_abyssal_maw_fish': {
    pt: 'A boca parece maior que o corpo; o abismo aprova.',
    en: 'Its mouth seems larger than its body; the abyss approves.',
  },
  'rare_fishs-13_ghost_ray_fish': {
    pt: 'Passa sem som, como um lençol fantasma sobre ruínas submersas.',
    en: 'It passes silently, like a ghost sheet over drowned ruins.',
  },
  'rare_fishs-14_blood_starfish': {
    pt: 'Uma estrela vermelha presa às rochas, bela e inquietante.',
    en: 'A red star fixed to the rocks, beautiful and unsettling.',
  },
  'rare_fishs-15_leaf_camouflage_fish': {
    pt: 'Imita folhas mortas para vencer olhos apressados.',
    en: 'It mimics dead leaves to defeat impatient eyes.',
  },
  'rare_fishs-16_shadow_serpent_fish': {
    pt: 'Serpente de sombra; só aparece quando já está indo embora.',
    en: 'A serpent of shadow; seen only as it leaves.',
  },
  'rare_fishs-17_dark_nautilus': {
    pt: 'Carrega uma espiral escura, como memória enrolada do oceano.',
    en: 'It carries a dark spiral, like the ocean winding up a memory.',
  },
  'rare_rings-1_sapphire_oval_ring': {
    pt: 'Safira oval, azul como uma janela aberta para águas profundas.',
    en: 'An oval sapphire, blue as a window into deep water.',
  },
  'rare_rings-2_compass_star_ring': {
    pt: 'Uma estrela-guia em metal, feita para dedos que se perderam.',
    en: 'A metal guiding star, made for fingers that lost their way.',
  },
  'rare_rings-3_turquoise_swirl_ring': {
    pt: 'O turquesa gira como correnteza presa em joia.',
    en: 'Turquoise swirls like a current trapped inside a jewel.',
  },
  'rare_rings-4_cthulhu_skull_ring': {
    pt: 'Caveira ritualística, lembrança de cultos que temiam a superfície.',
    en: 'A ritual skull, memory of cults that feared the surface.',
  },
  'rare_rings-5_amethyst_oval_ring': {
    pt: 'A ametista guarda um roxo calmo, quase sonhando.',
    en: 'The amethyst keeps a calm purple, almost dreaming.',
  },
  'rare_rings-6_ruby_rectangle_ring': {
    pt: 'Rubi retangular, vermelho como uma promessa feita sob pressão.',
    en: 'A rectangular ruby, red as a promise made under pressure.',
  },
  'rare_rings-7_vine_sapphire_ring': {
    pt: 'Ramos envolvem a safira, como vida insistindo no metal.',
    en: 'Vines wrap the sapphire, as if life insists upon metal.',
  },
  'rare_rings-8_marquise_sapphire_ring': {
    pt: 'Corte afiado e nobre; a safira parece apontar o caminho.',
    en: 'Sharp and noble cut; the sapphire seems to point the way.',
  },
  'rare_rings-9_obsidian_oval_ring': {
    pt: 'Obsidiana oval, negra como portas que ninguém abriu.',
    en: 'Oval obsidian, black as doors no one opened.',
  },
  'rare_rings-10_emerald_leaf_ring': {
    pt: 'Folha de esmeralda, verde demais para ter morado no fundo.',
    en: 'An emerald leaf, too green to have lived below.',
  },
  'old_relics-dead_pirate': {
    pt: 'Um velho pirata não largou seu tesouro por nada, nem pela vida...',
    en: 'An old pirate would not let go of his treasure for anything, not even life itself...',
  },
  'old_relics-collar_necklace': {
    pt: 'Um colar de cerimônia que ainda guarda marcas de sal, luto e promessa.',
    en: 'A ceremonial necklace still marked by salt, grief, and an old promise.',
  },
  'old_relics-futuristic_artifact': {
    pt: 'Ninguém sabe quem criou este mecanismo. Ele parece velho demais para ser do futuro.',
    en: 'No one knows who built this device. It seems far too old to belong to the future.',
  },
  'old_relics-golden_anchor': {
    pt: 'Uma âncora dourada pequena demais para prender navios, mas pesada o bastante para prender memórias.',
    en: 'A golden anchor too small to hold ships, yet heavy enough to hold memories.',
  },
  'old_relics-golden_coins': {
    pt: 'Moedas que atravessaram eras no fundo do mar, comprando apenas silêncio.',
    en: 'Coins that crossed ages beneath the sea, buying nothing but silence.',
  },
  'old_relics-golden_cup': {
    pt: 'Um cálice intacto, como se a última celebração tivesse terminado minutos atrás.',
    en: 'An untouched cup, as if the last celebration ended only minutes ago.',
  },
  'old_relics-golden_north': {
    pt: 'Uma bússola nobre que aponta para algo mais antigo que o norte.',
    en: 'A noble compass pointing toward something older than north.',
  },
  'old_relics-golden_watch': {
    pt: 'O relógio parou no instante em que a água venceu a cabine.',
    en: 'The watch stopped the moment the water claimed the cabin.',
  },
  'old_relics-hourglass': {
    pt: 'A areia ainda escorre devagar, recusando-se a aceitar que o tempo acabou.',
    en: 'Its sand still falls slowly, refusing to accept that time is over.',
  },
  'old_relics-j_j_1866_revolver': {
    pt: 'Um revólver antigo, frio, pesado, e cheio de histórias que ninguém confessou.',
    en: 'An old revolver, cold and heavy, filled with stories no one confessed.',
  },
  'old_relics-lz_vinyl': {
    pt: 'Um disco salvo do abismo; algumas músicas insistem em sobreviver ao mundo.',
    en: 'A record rescued from the abyss; some songs insist on outliving the world.',
  },
  'old_relics-message_in_a_bottle': {
    pt: 'A garrafa chegou tarde demais, mas a mensagem ainda quer ser encontrada.',
    en: 'The bottle arrived too late, but the message still wants to be found.',
  },
  'old_relics-old_artifact': {
    pt: 'Um artefato sem origem clara, moldado por mãos que talvez nem fossem humanas.',
    en: 'An artifact of unclear origin, shaped by hands that may not have been human.',
  },
  'old_relics-old_book': {
    pt: 'Páginas encharcadas guardam mapas, nomes e uma última anotação tremida.',
    en: 'Waterlogged pages hold maps, names, and one final trembling note.',
  },
  'old_relics-old_golden_key': {
    pt: 'Uma chave dourada sem porta conhecida. O mistério é sua fechadura.',
    en: 'A golden key with no known door. The mystery is its lock.',
  },
  'old_relics-old_joystick': {
    pt: 'Um controle antigo, sobrevivente improvável de uma diversão que afundou com seus donos.',
    en: 'An old controller, unlikely survivor of a joy that sank with its owners.',
  },
  'old_relics-old_map': {
    pt: 'O mapa mostra ilhas que não existem mais e rotas que talvez nunca tenham existido.',
    en: 'The map shows islands long gone and routes that may never have existed.',
  },
  'old_relics-old_shield': {
    pt: 'Um escudo gasto pela água, ainda posicionado como se protegesse alguém.',
    en: 'A shield worn by water, still positioned as if protecting someone.',
  },
  'old_relics-shell_pearl': {
    pt: 'Uma pérola escondida em concha antiga, brilhando como uma lua submersa.',
    en: 'A pearl hidden in an ancient shell, shining like a drowned moon.',
  },
  'old_relics-strange_mask': {
    pt: 'A máscara estranha encara de volta. Talvez ela tenha sido feita para isso.',
    en: 'The strange mask stares back. Perhaps that is what it was made for.',
  },
};

const getDefaultLore = (id: string, name: string, category: NewEarthTreasureCategory): Record<'pt' | 'en', string> => {
  if (TREASURE_LORE[id]) return TREASURE_LORE[id];

  if (category === 'rare_fish') {
    return {
      pt: `${name} foi visto poucas vezes nas zonas profundas; sua presença indica que o oceano ainda guarda vida impossível.`,
      en: `${name} has rarely been seen in the deep zones; its presence proves the ocean still shelters impossible life.`,
    };
  }

  if (category === 'rare_ring') {
    return {
      pt: `${name} repousou no fundo do mar por décadas, esperando uma mão corajosa o bastante para recuperá-lo.`,
      en: `${name} rested on the seafloor for decades, waiting for a hand brave enough to recover it.`,
    };
  }

  return {
    pt: `${name} carrega marcas do velho mundo e uma história que a água quase apagou.`,
    en: `${name} carries marks of the old world and a story the water nearly erased.`,
  };
};

const createTreasure = (
  category: NewEarthTreasureCategory,
  folder: string,
  file: string,
  rarity: NewEarthTreasureRarity
): NewEarthTreasure => {
  const fileId = file.replace(/\.(webp|png|jpg|jpeg)$/i, '');
  const id = `${folder}-${fileId}`;
  const name = toDisplayName(file);
  return {
    id,
    name,
    src: `${TREASURE_RELIC_BASE}/${folder}/${file}`,
    category,
    rarity,
    lore: getDefaultLore(id, name, category),
  };
};

export const NEW_EARTH_RARE_FISH_TREASURES = [
  '1_serpent_fish.webp',
  '2_spiky_angler_fish.webp',
  '3_neon_angler_fish.webp',
  '4_golden_rock_fish.webp',
  '5_emerald_fin_fish.webp',
  '6_purple_angler_fish.webp',
  '7_abyssal_eye_fish.webp',
  '8_green_thorn_fish.webp',
  '9_spiky_puffer_fish.webp',
  '10_obsidian_flat_fish.webp',
  '11_crimson_jellyfish.webp',
  '12_abyssal_maw_fish.webp',
  '13_ghost_ray_fish.webp',
  '14_blood_starfish.webp',
  '15_leaf_camouflage_fish.webp',
  '16_shadow_serpent_fish.webp',
  '17_dark_nautilus.webp',
].map(file => createTreasure('rare_fish', 'rare_fishs', file, 'epic'));

export const NEW_EARTH_RARE_RING_TREASURES = [
  '1_sapphire_oval_ring.webp',
  '2_compass_star_ring.webp',
  '3_turquoise_swirl_ring.webp',
  '4_cthulhu_skull_ring.webp',
  '5_amethyst_oval_ring.webp',
  '6_ruby_rectangle_ring.webp',
  '7_vine_sapphire_ring.webp',
  '8_marquise_sapphire_ring.webp',
  '9_obsidian_oval_ring.webp',
  '10_emerald_leaf_ring.webp',
].map(file => createTreasure('rare_ring', 'rare_rings', file, 'legendary'));

export const NEW_EARTH_RELIC_TREASURES = [
  'collar_necklace.webp',
  'dead_pirate.webp',
  'futuristic_artifact.webp',
  'golden_anchor.webp',
  'golden_coins.webp',
  'golden_cup.webp',
  'golden_north.webp',
  'golden_watch.webp',
  'hourglass.webp',
  'j_j_1866_revolver.webp',
  'lz_vinyl.webp',
  'message_in_a_bottle.webp',
  'old_artifact.webp',
  'old_book.webp',
  'old_golden_key.webp',
  'old_joystick.webp',
  'old_map.webp',
  'old_shield.webp',
  'shell_pearl.webp',
  'strange_mask.webp',
].map(file => createTreasure('relic', 'old_relics', file, 'rare'));

export const NEW_EARTH_TREASURE_CATALOG = [
  ...NEW_EARTH_RARE_FISH_TREASURES,
  ...NEW_EARTH_RELIC_TREASURES,
  ...NEW_EARTH_RARE_RING_TREASURES,
];

export const NEW_EARTH_TREASURES_BY_RARITY = {
  rare: NEW_EARTH_RELIC_TREASURES,
  epic: NEW_EARTH_RARE_FISH_TREASURES,
  legendary: NEW_EARTH_RARE_RING_TREASURES,
} satisfies Record<NewEarthTreasureRarity, NewEarthTreasure[]>;

export const normalizeNewEarthMuseumTreasures = (value: unknown): NewEarthMuseumTreasures => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};

  const normalized: NewEarthMuseumTreasures = {};
  Object.entries(value as Record<string, any>).forEach(([key, item]) => {
    const treasure = item && typeof item === 'object'
      ? NEW_EARTH_TREASURE_CATALOG.find(entry => entry.id === item.id || entry.id === key)
      : null;

    if (!treasure) return;

    normalized[treasure.id] = {
      ...treasure,
      foundAt: Math.max(0, Number(item.foundAt) || 0),
      siteId: typeof item.siteId === 'string' ? item.siteId : undefined,
      colonyId: typeof item.colonyId === 'string' ? item.colonyId : undefined,
    };
  });

  return normalized;
};
