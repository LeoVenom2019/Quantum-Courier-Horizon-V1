import { Language } from './i18n';
import { 
  ROUTES, 
  UPGRADES, 
  ORES, 
  ROBOT_UPGRADES, 
  EXTRACTION_POINTS, 
  TECHNOLOGIES 
} from './game-data';

export const ROUTES_MAP = new Map(ROUTES.map(r => [r.id, r]));
export const UPGRADES_MAP = new Map(UPGRADES.map(u => [u.id, u]));
export const ORES_MAP = new Map(ORES.map(o => [o.id, o]));
export const ROBOT_UPGRADES_MAP = new Map(ROBOT_UPGRADES.map(u => [u.level, u]));
export const EXTRACTION_POINTS_MAP = new Map(EXTRACTION_POINTS.map(p => [p.id, p]));
export const TECHNOLOGIES_MAP = new Map(TECHNOLOGIES.map(t => [`${t.tier}-${t.level}`, t]));

export const EXTRACTION_PRODUCTION_VALUES = [1, 2, 4, 6, 8, 10, 15];
export const EXTRACTION_PRODUCTION_COSTS = [0, 1000000, 4000000, 10000000, 30000000, 50000000, 500000000];

export const ROUTE_3_END_STEPS = [
  { text: { en: 'The Void is silent, but it is not empty. Prepare your fleet.', pt: 'O Vazio é silencioso, mas não está vazio. Prepare sua frota.' }, type: 'info' },
  { text: { en: 'I detect massive energy spikes. Something is coming.', pt: 'Detecto picos massivos de energia. Algo está vindo.' }, type: 'info' }
];

export const VOID_WAR_START_LORE = {
  pt: [
    'ALERTA DE SEGURANÇA CRÍTICO!',
    'Mestre, meus sensores estão fritando... detecto assinaturas biológicas massivas!',
    'Não são naves... são HORDAS de criaturas saindo da Fenda Quântica!',
    'A estrutura de reconstrução da Terra está sendo cercada por biomassa faminta!',
    'O Vazio está cuspindo seus horrores sobre nós! Elimine essas abominações IMEDIATAMENTE!'
  ],
  en: [
    'CRITICAL SECURITY ALERT!',
    'Master, my sensors are frying... I detect massive biological signatures!',
    'These are not ships... they are SWARMS of creatures emerging from the Quantum Rift!',
    'Earth\'s reconstruction structure is being surrounded by hungry biomass!',
    'The Void is spitting its horrors at us! Eliminate these abominations IMMEDIATELY!'
  ]
};

export const SHIPS_ROUTE_3_STEPS = [
  { text: { en: 'Silence.', pt: 'Silêncio.' }, type: 'info' },
  { text: { en: 'No alarms.\nNo distress calls.\nNo enemy signal.', pt: 'Nenhum alarme.\nNenhum pedido de socorro.\nNenhum sinal inimigo.' }, type: 'info' },
  { text: { en: 'Only Earth.', pt: 'Só a Terra.' }, type: 'success' },
  { text: { en: 'The final Project Earth data is confirmed.', pt: 'Os últimos dados do Projeto Terra são confirmados.' }, type: 'success' },
  { text: { en: 'Chapter 3 defense routes close one by one.', pt: 'As rotas de defesa do Capítulo 3 se fecham uma a uma.' }, type: 'info' },
  { text: { en: 'The Void retreats, but it does not disappear.', pt: 'O Vazio recua, mas não desaparece.' }, type: 'danger' },
  { text: { en: 'Bobby Blue stays silent for too long.', pt: 'Bobby Blue fica em silêncio por tempo demais.' }, type: 'robot' },
  { text: { en: '"Boss... something is answering from down there."', pt: '"Chefe... tem alguma coisa respondendo daqui de baixo."' }, type: 'robot' },
  { text: { en: 'Thin lines of light spread across Earth\'s surface.', pt: 'A superfície da Terra acende em linhas finas.' }, type: 'success' },
  { text: { en: 'It does not look like a city.\nIt does not look like a machine.', pt: 'Não parece uma cidade.\nNão parece uma máquina.' }, type: 'info' },
  { text: { en: 'It looks like an organism waking up.', pt: 'Parece um organismo acordando.' }, type: 'success' },
  { text: { en: 'The old war map loses signal.', pt: 'O antigo mapa de guerra perde sinal.' }, type: 'danger' },
  { text: { en: 'Chapter 3 commands are closed.', pt: 'Os comandos do Capítulo 3 são encerrados.' }, type: 'info' },
  { text: { en: 'The panels change before you touch anything.', pt: 'Os painéis mudam antes de você tocar em qualquer coisa.' }, type: 'info' },
  { text: { en: 'PROTOCOL EARTH UPDATED.', pt: 'PROTOCOLO TERRA ATUALIZADO.' }, type: 'success' },
  { text: { en: 'Reconstruction is no longer a promise.', pt: 'A reconstrução deixou de ser promessa.' }, type: 'success' },
  { text: { en: 'Now it demands presence.', pt: 'Agora ela exige presença.' }, type: 'info' },
  { text: { en: 'Chapter 4 - New Earth initiated.', pt: 'Capítulo 4 - Nova Terra iniciado.' }, type: 'success' },
];

export const MISSION_RARITY_UPGRADE_COSTS = [
  1000, 5000, 10000, 25000, 75000, 
  200000, 500000, 1250000, 3000000, 7500000, 
  20000000, 50000000, 125000000, 300000000, 1000000000
];

export const PRIVATE_POLICE_COSTS = [10000, 50000, 250000, 1250000, 5000000, 25000000];

export const getDoubleRouteMultiplier = (level: number) => {
  switch (level) {
    case 1: return 2;
    case 2: return 3;
    case 3: return 5;
    case 4: return 6.5;
    case 5: return 8;
    default: return 1;
  }
};

export const getPoliceBonus = (level: number) => level === 6 ? 85 : level * 10;

export const DOUBLE_ROUTE_COSTS = [1000000, 3000000, 5000000, 7000000, 10000000];

export const DOOM_P_COSTS = [
  1000000, 5000000, 10000000, 20000000, 50000000, 
  150000000, 400000000, 1000000000, 2500000000, 6000000000
];
export const getDoomPBonus = (level: number) => level * 10;

export const ROUTE2_LORE_LINES = [
  "Ano 3001",
  "Capítulo 2 - As Rotas Interestelares",
  "Mestre, ultrapassamos as fronteiras do nosso sistema doméstico.",
  "As estrelas das Rotas Interestelares brilham com uma intensidade que nossos sensores nunca viram.",
  "Aqui, os créditos fluem como rios de luz, mas os riscos crescem proporcionalmente.",
  "Novas tecnologias de dobra nos permitiram alcançar setores antes inalcançáveis.",
  "Mas cuidado... a densidade de radiação nessas travessias exige naves mais robustas.",
  "A humanidade está de olho neste novo capítulo. O lucro é imenso.",
  "Prepare-se para lidar com as flutuações do mercado solar e a pirataria avançada.",
  "Iniciando transição de capítulo... Que o brilho das estrelas guie seu caminho.",
  "---",
  "Capítulo 2 - Rotas Interestelares conectado. O espaço profundo te aguarda."
];

export const VOID_LORE_LINES = [
  "Ano (??)",
  "Capítulo 3 - Rotas do Vazio: Projeto Terra",
  "Mestre... meus sensores estão detectando algo impossível.",
  "Não estamos mais apenas no espaço interestelar. Estamos na borda da realidade.",
  "O Vazio. Um lugar onde o tempo se dobra e a matéria perde o sentido.",
  "As estrelas aqui não brilham... elas sussurram.",
  "E o que detecto lá fora... não são máquinas. São formas de vida aberrantes.",
  "Biomassa faminta que desafia toda a biologia que conhecemos.",
  "As Inteligências Artificiais de Elite parecem ter se fundido a essas abominações.",
  "Não estamos mais apenas entregando carga, mestre.",
  "Estamos lutando contra horrores que devoram a própria luz.",
  "Prepare sua frota. No Vazio, a única regra é continuar avançando...",
  "...ou ser consumido por essas criaturas.",
  "---",
  "Capítulo 3 - Rotas do Vazio: Projeto Terra iniciado. O Vazio te observa com olhos que nunca piscam."
];
