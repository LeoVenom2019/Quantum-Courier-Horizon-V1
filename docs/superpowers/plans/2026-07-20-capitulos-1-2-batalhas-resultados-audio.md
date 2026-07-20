# Capítulos 1 e 2 — Batalhas, Resultados e Áudio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar temas próprios para batalhas manuais Solar/Interestelar, novas telas holográficas leves de vitória/derrota e cobertura estática dos sete assets no preloader, sem alterar batalhas automáticas.

**Architecture:** Um módulo puro centraliza URLs, seleção aleatória e regras de elegibilidade/resultado; ele pode ser testado com `node:test` sem novas dependências. Um componente focado controla a experiência manual dos capítulos 1 e 2, enquanto `BattleOverlay` mantém o resultado legado para automações e demais rotas. A jukebox e o preloader consomem as mesmas constantes para evitar divergência e assets órfãos.

**Tech Stack:** Next.js 15, React 19, TypeScript 5.9, Motion, Tailwind CSS 4, HTMLAudioElement, Node.js `node:test`.

## Global Constraints

- Alterar apenas batalhas manuais `Solar` e `Interstellar`; `deliveryId` iniciado por `auto-` mantém o comportamento atual.
- Não adicionar dependências, imagens ou vídeos.
- Não usar `backdrop-blur`, filtros animados, grandes áreas borradas ou grandes quantidades de partículas.
- Respeitar o estado `musicOn`, o volume da jukebox e erros de autoplay `AbortError`/`NotAllowedError`.
- Não adicionar temas de vitória ou derrota à jukebox.
- Não criar commits, branches ou pushes sem solicitação explícita do usuário.

---

## File Structure

- Create `lib/solar-interstellar-battle-media.mjs`: constantes e funções puras de decisão/seleção.
- Create `lib/solar-interstellar-battle-media.d.ts`: contrato TypeScript do módulo puro.
- Create `lib/solar-interstellar-battle-media.test.mjs`: testes Node das regras e da cobertura dos assets.
- Create `components/dashboard/SolarInterstellarBattleExperience.tsx`: arena manual, ciclo de áudio e telas holográficas de resultado.
- Modify `components/dashboard/BattleOverlay.tsx`: delegar apenas as batalhas manuais dos capítulos 1 e 2 ao componente novo e manter o fallback legado.
- Modify `components/GameDashboard.tsx`: fornecer `musicOn` e a jukebox ao overlay.
- Modify `lib/music-data.ts`: adicionar somente os quatro temas de batalha às playlists Solar/Interestelar.
- Modify `lib/asset-preloader.ts`: incluir os temas de resultado e a derrota compartilhada nos grupos de rota.
- Modify `package.json`: adicionar script `test:battle-media` baseado em `node --test`.

### Task 1: Regras e catálogo de mídia

**Files:**
- Create: `lib/solar-interstellar-battle-media.mjs`
- Create: `lib/solar-interstellar-battle-media.d.ts`
- Create: `lib/solar-interstellar-battle-media.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces: `SOLAR_INTERSTELLAR_BATTLE_MEDIA`, `isSolarInterstellarManualBattle(routeTier, deliveryId)`, `pickManualBattleTheme(routeTier, randomValue?)`, `getManualBattleResultAudio(routeTier, outcome)`.

- [ ] **Step 1: Escrever os testes falhos para elegibilidade, sorteio e resultado**

Cobrir no teste:

```js
assert.equal(isSolarInterstellarManualBattle('Solar', undefined), true);
assert.equal(isSolarInterstellarManualBattle('Interstellar', 'manual-42'), true);
assert.equal(isSolarInterstellarManualBattle('Solar', 'auto-42'), false);
assert.equal(isSolarInterstellarManualBattle('Void', undefined), false);
assert.equal(pickManualBattleTheme('Solar', 0), SOLAR_INTERSTELLAR_BATTLE_MEDIA.Solar.battleThemes[0]);
assert.equal(pickManualBattleTheme('Solar', 0.999), SOLAR_INTERSTELLAR_BATTLE_MEDIA.Solar.battleThemes[1]);
assert.equal(getManualBattleResultAudio('Interstellar', 'victory'), SOLAR_INTERSTELLAR_BATTLE_MEDIA.Interstellar.victoryTheme);
assert.equal(getManualBattleResultAudio('Solar', 'defeat'), SOLAR_INTERSTELLAR_BATTLE_MEDIA.defeatTheme);
```

- [ ] **Step 2: Executar o teste e confirmar RED**

Run: `node --test lib/solar-interstellar-battle-media.test.mjs`

Expected: FAIL porque o módulo ainda não existe.

- [ ] **Step 3: Implementar o catálogo e as funções mínimas**

Usar URLs exatas sob `/audio/solar_interestelar/`, limitar o valor aleatório ao intervalo válido e retornar `null` para rotas/resultados fora do escopo. Declarar os tipos de rota e resultado no `.d.ts` para manter importações estritas no TypeScript.

- [ ] **Step 4: Adicionar o script e confirmar GREEN**

Adicionar a `package.json`:

```json
"test:battle-media": "node --test lib/solar-interstellar-battle-media.test.mjs"
```

Run: `npm run test:battle-media`

Expected: todos os testes do catálogo passam.

### Task 2: Jukebox e preloader protegidos pelo catálogo

**Files:**
- Modify: `lib/music-data.ts`
- Modify: `lib/asset-preloader.ts`
- Modify: `lib/solar-interstellar-battle-media.test.mjs`

**Interfaces:**
- Consumes: `SOLAR_INTERSTELLAR_BATTLE_MEDIA`.
- Produces: quatro faixas de batalha na biblioteca; sete URLs cobertas pelos grupos `route1`/`route2`.

- [ ] **Step 1: Estender os testes com invariantes de biblioteca e preload**

Testar listas exportadas pelo catálogo:

```js
assert.deepEqual(SOLAR_INTERSTELLAR_BATTLE_MEDIA.Solar.battleThemes.length, 2);
assert.deepEqual(SOLAR_INTERSTELLAR_BATTLE_MEDIA.Interstellar.battleThemes.length, 2);
assert.equal(jukeboxEligibleUrls.includes(SOLAR_INTERSTELLAR_BATTLE_MEDIA.Solar.victoryTheme), false);
assert.equal(jukeboxEligibleUrls.includes(SOLAR_INTERSTELLAR_BATTLE_MEDIA.defeatTheme), false);
```

Também ler `music-data.ts` e `asset-preloader.ts` como texto no teste para comprovar que ambos importam o catálogo central, evitando duplicação literal silenciosa.

- [ ] **Step 2: Executar e confirmar RED**

Run: `npm run test:battle-media`

Expected: FAIL porque jukebox/preloader ainda não consomem o catálogo.

- [ ] **Step 3: Integrar a jukebox**

Adicionar duas faixas ao fim da playlist `Solar` e duas ao fim da playlist `Interstellar`, usando as URLs do catálogo:

```ts
{ id: 'r1_battle_1', title: 'Solar Battle I', url: SOLAR_INTERSTELLAR_BATTLE_MEDIA.Solar.battleThemes[0] }
{ id: 'r1_battle_2', title: 'Solar Battle II', url: SOLAR_INTERSTELLAR_BATTLE_MEDIA.Solar.battleThemes[1] }
{ id: 'r2_battle_1', title: 'Interstellar Battle I', url: SOLAR_INTERSTELLAR_BATTLE_MEDIA.Interstellar.battleThemes[0] }
{ id: 'r2_battle_2', title: 'Interstellar Battle II', url: SOLAR_INTERSTELLAR_BATTLE_MEDIA.Interstellar.battleThemes[1] }
```

- [ ] **Step 4: Integrar o preloader**

Como `routeThemeAudio()` já captura as playlists, adicionar explicitamente apenas os áudios que não pertencem à jukebox:

```ts
// route1 audio
SOLAR_INTERSTELLAR_BATTLE_MEDIA.Solar.victoryTheme,
SOLAR_INTERSTELLAR_BATTLE_MEDIA.defeatTheme,

// route2 audio
SOLAR_INTERSTELLAR_BATTLE_MEDIA.Interstellar.victoryTheme,
SOLAR_INTERSTELLAR_BATTLE_MEDIA.defeatTheme,
```

- [ ] **Step 5: Confirmar GREEN**

Run: `npm run test:battle-media`

Expected: catálogo, exclusões da jukebox e referências estáticas passam.

### Task 3: Experiência manual e ciclo de áudio

**Files:**
- Create: `components/dashboard/SolarInterstellarBattleExperience.tsx`
- Modify: `components/dashboard/BattleOverlay.tsx`
- Modify: `components/GameDashboard.tsx`
- Modify: `lib/solar-interstellar-battle-media.test.mjs`

**Interfaces:**
- Consumes: catálogo/regras da Task 1, callbacks existentes de `BattleOverlay`, `musicOn`, `jukebox.volume`, `jukebox.stop`, `jukebox.playPlaylist`.
- Produces: componente que renderiza `VoidBattleArena` durante combate e o novo resultado ao finalizar.

- [ ] **Step 1: Adicionar teste falho da fronteira manual/automática**

Verificar por leitura estática que `BattleOverlay.tsx` chama `isSolarInterstellarManualBattle` antes de delegar ao componente e que o ramo legado de resultado continua presente.

Run: `npm run test:battle-media`

Expected: FAIL antes da integração do componente.

- [ ] **Step 2: Extrair a arena Solar/Interestelar para o componente novo**

Mover a configuração de `VoidBattleArena`, transformação de inimigo, callback `onBattleEnd`, saída forçada e recompensas de meteoros sem alterar suas fórmulas. O componente deve receber os mesmos callbacks e dados já fornecidos ao ramo atual.

- [ ] **Step 3: Implementar o ciclo de áudio com refs e effects**

Ao montar combate manual:

```ts
const battleTheme = pickManualBattleTheme(routeTier);
jukebox.stop({ rememberPreference: false });
const audio = new Audio(battleTheme);
audio.loop = true;
audio.volume = Math.min(0.8, Math.max(0.18, Number(jukebox.volume ?? 0.5) * 0.95));
```

Ao mudar para resultado, parar/resetar o tema e tocar uma vez o retorno de `getManualBattleResultAudio`. Na desmontagem, limpar todos os áudios e retomar `ROUTE_THEMES[routeTier].playlist` somente se `musicOn` estiver ativo. Ignorar apenas `AbortError` e `NotAllowedError`; outros erros geram `console.warn` contextual.

- [ ] **Step 4: Restringir a delegação às batalhas manuais**

Em `BattleOverlay`, delegar antes do resultado legado somente quando:

```ts
isSolarInterstellarManualBattle(routeTier, activeBattle.deliveryId)
```

As batalhas `auto-*` continuam passando pela árvore atual e, portanto, preservam UI e áudio existentes.

- [ ] **Step 5: Fornecer música e jukebox pelo dashboard**

Adicionar `musicOn` e `jukebox` ao contrato de `BattleOverlay` e à chamada existente em `GameDashboard.tsx`, sem criar novo estado global.

- [ ] **Step 6: Confirmar GREEN e tipos**

Run: `npm run test:battle-media`

Expected: todas as regras e a fronteira manual/automática passam.

Run: `npx tsc --noEmit`

Expected: exit code 0.

### Task 4: HUD holográfico leve de resultado

**Files:**
- Modify: `components/dashboard/SolarInterstellarBattleExperience.tsx`

**Interfaces:**
- Consumes: `activeBattle`, `routeTier`, `language`, `formatValue`, `finishBattle`.
- Produces: três variantes visuais: vitória Solar, vitória Interestelar e derrota compartilhada.

- [ ] **Step 1: Adicionar teste estático falho das restrições de desempenho**

Ler o componente como texto e afirmar ausência de `backdrop-blur`, `filter:`, `<Image` e `<video`; afirmar presença de variantes Solar, Interestelar e derrota e de `motion-reduce`.

Run: `npm run test:battle-media`

Expected: FAIL porque o HUD ainda não existe.

- [ ] **Step 2: Construir o plano de fundo técnico leve**

Usar fundo opaco translúcido, dois gradientes CSS estáticos, grade de linhas finas e no máximo oito pontos decorativos. Animações limitadas a `opacity`, `scale`, `x` e `y`, com classes `motion-reduce:animate-none` onde houver animação CSS.

- [ ] **Step 3: Construir cabeçalho e telemetria**

Exibir capítulo, estado da missão, título localizado, nome do inimigo e indicador de transmissão. Solar usa âmbar/dourado; Interestelar usa ciano/violeta; derrota substitui ambos por carmesim sem perder a identificação do capítulo.

- [ ] **Step 4: Construir recompensas e ação**

Na vitória, exibir QC e condicionalmente XP/Etérion, além dos dados de meteoros já existentes. Na derrota, exibir relatório de nave perdida/interceptada. Manter `PremiumCanvasButton`, com tom `green`/`red`, foco visível e texto localizado.

- [ ] **Step 5: Validar responsividade e desempenho estrutural**

Garantir `overflow-y-auto`, altura máxima baseada em viewport e grades `grid-cols-1 sm:grid-cols-*`. Confirmar que não existem classes `backdrop-blur` no novo componente.

Run: `npm run test:battle-media`

Expected: todos os testes passam.

### Task 5: Verificação integral

**Files:**
- Verify: todos os arquivos alterados nas Tasks 1–4.

**Interfaces:**
- Produces: evidência fresca de testes, tipos, lint e build.

- [ ] **Step 1: Executar testes focados**

Run: `npm run test:battle-media`

Expected: 0 falhas.

- [ ] **Step 2: Executar TypeScript**

Run: `npx tsc --noEmit`

Expected: exit code 0.

- [ ] **Step 3: Executar ESLint nos arquivos tocados**

Run: `npx eslint components/dashboard/BattleOverlay.tsx components/dashboard/SolarInterstellarBattleExperience.tsx components/GameDashboard.tsx lib/music-data.ts lib/asset-preloader.ts`

Expected: exit code 0, sem novos erros.

- [ ] **Step 4: Executar build de produção**

Run: `npm run build`

Expected: build Next.js concluído com exit code 0.

- [ ] **Step 5: Auditar diff e assets**

Run: `git diff --check`

Expected: nenhuma saída.

Run: `git status --short`

Expected: apenas os sete novos áudios, documentos e arquivos de implementação planejados aparecem como modificados/não rastreados.
