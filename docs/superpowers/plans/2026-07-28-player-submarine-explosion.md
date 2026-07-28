# Player Submarine Explosion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mostrar a explosão do submarino do jogador por 1,2 segundo quando o casco chegar a zero e somente então apresentar “Submarino explodido” e “GAME OVER”.

**Architecture:** `NewEarthUnderwaterBattle` ganha a fase interna `player_exploding`, que congela a simulação de combate, mantém o render dos efeitos e agenda a derrota. O mesmo `spawnImpact` usado na destruição inimiga gera a explosão do jogador. `GameDashboard` recebe apenas a atualização do texto registrado pelo callback existente.

**Tech Stack:** React, TypeScript, Canvas 2D, Node.js Test Runner, ESLint, Next.js.

## Global Constraints

- Trabalhar somente em `D:\PROJETOS\QCH`.
- Preservar as alterações pendentes que removem as faixas horizontais da água.
- A explosão visual dura exatamente 1.200 ms.
- A derrota por oxigênio continua separada e mantém a mensagem `Oxigênio esgotado`.
- Não adicionar dependências.
- Não criar commit nem push sem pedido explícito do usuário.

---

## File Structure

- Create: `lib/new-earth-underwater-player-explosion.test.mjs` — teste de regressão do fluxo completo por inspeção de fonte.
- Modify: `components/NewEarthUnderwaterBattle.tsx` — fase intermediária, explosão, bloqueio de entrada, render e textos de derrota.
- Modify: `components/GameDashboard.tsx` — texto do registro de derrota submarina.

### Task 1: Fluxo visual e apresentação da derrota

**Files:**
- Create: `lib/new-earth-underwater-player-explosion.test.mjs`
- Modify: `components/NewEarthUnderwaterBattle.tsx`
- Modify: `components/GameDashboard.tsx`

**Interfaces:**
- Consumes: `spawnImpact(x, y, color, isKill, scale)`, `SUBMARINE_EXPLOSION_SFX`, `onDefeat?: () => void`.
- Produces: fase interna `player_exploding`, campo interno `playerExplosionEndsAt: number` e rótulo React `gameOver`.

- [ ] **Step 1: Escrever o teste de regressão que inicialmente falha**

Criar `lib/new-earth-underwater-player-explosion.test.mjs`:

```js
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const battleSourceUrl = new URL(
  '../components/NewEarthUnderwaterBattle.tsx',
  import.meta.url,
);
const dashboardSourceUrl = new URL(
  '../components/GameDashboard.tsx',
  import.meta.url,
);

test('animates the player submarine explosion before showing game over', async () => {
  const source = await readFile(battleSourceUrl, 'utf8');

  assert.match(source, /phase: 'combat' as 'combat' \| 'exploration' \| 'player_exploding' \| 'defeat'/);
  assert.match(source, /playerExplosionEndsAt: 0/);
  assert.match(
    source,
    /spawnImpact\(state\.player\.x, state\.player\.y, '#f87171', true, 1\.45\)/,
  );
  assert.match(source, /state\.playerExplosionEndsAt = time \+ 1200/);
  assert.match(
    source,
    /state\.phase === 'player_exploding'[\s\S]*?time >= state\.playerExplosionEndsAt[\s\S]*?state\.phase = 'defeat'[\s\S]*?onDefeat\?\.\(\)/,
  );
  assert.match(source, /state\.phase !== 'player_exploding'[\s\S]*?drawPlayerSpriteSubmarine/);
});

test('shows the requested defeat copy after the explosion', async () => {
  const source = await readFile(battleSourceUrl, 'utf8');

  assert.match(source, /defeat: language === 'pt' \? 'Submarino explodido' : 'Submarine exploded'/);
  assert.match(source, /gameOver: 'GAME OVER'/);
  assert.match(source, /\{labels\.gameOver\}/);
  assert.match(source, /setPortalFeedback\(labels\.oxygenDepleted\)/);
});

test('records that the submarine exploded', async () => {
  const source = await readFile(dashboardSourceUrl, 'utf8');

  assert.match(source, /Submarino explodiu durante a missão\./);
  assert.match(source, /Submarine exploded during the mission\./);
});
```

- [ ] **Step 2: Executar o teste e confirmar a falha esperada**

Run:

```powershell
node --test lib/new-earth-underwater-player-explosion.test.mjs
```

Expected: FAIL nos três testes, pois a fase, os textos e o registro ainda não existem.

- [ ] **Step 3: Implementar a fase intermediária e o bloqueio de entrada**

Em `components/NewEarthUnderwaterBattle.tsx`:

- ampliar a união de `state.phase` para `'combat' | 'exploration' | 'player_exploding' | 'defeat'`;
- adicionar `playerExplosionEndsAt: 0` tanto na criação quanto na reinicialização de `stateRef`;
- aceitar movimento e simulação somente nas fases `combat` e `exploration`;
- ignorar `handleCanvasPointerDown` durante `player_exploding` e `defeat`;
- limpar `keysRef` e a fila de clique quando a explosão começar.

O início da destruição por casco deve usar:

```ts
spawnImpact(state.player.x, state.player.y, '#f87171', true, 1.45);
playRandomUnderwaterSound(SUBMARINE_EXPLOSION_SFX, 0.86);
stopUnderwaterSound(playerConstantMotorAudioRef.current);
playerConstantMotorAudioRef.current = null;
keysRef.current.clear();
aimRef.current.clickQueued = false;
state.shots = [];
state.player.vx = 0;
state.player.vy = 0;
state.player.thrust = 0;
state.playerExplosionEndsAt = time + 1200;
state.phase = 'player_exploding';
```

A transição, fora da simulação congelada e antes da atualização visual, deve ser:

```ts
if (
  state.phase === 'player_exploding'
  && time >= state.playerExplosionEndsAt
) {
  state.phase = 'defeat';
  setStatus('defeat');
  onDefeat?.();
}
```

Durante `player_exploding`, não desenhar `drawPropellerWake`, `drawNeptuneTurnLightImpact`, o sprite do jogador nem `drawTargetingReticle`. Continuar atualizando e desenhando `impacts`, `combatParticles`, água, bolhas e detritos.

- [ ] **Step 4: Atualizar os textos apresentados**

Em `NewEarthUnderwaterBattle.tsx`, definir:

```ts
defeat: language === 'pt' ? 'Submarino explodido' : 'Submarine exploded',
gameOver: 'GAME OVER',
```

Renderizar `{labels.gameOver}` abaixo de `{labels.defeat}` no painel final. Em `GameDashboard.tsx`, substituir o texto do log por:

```ts
language === 'pt'
  ? 'Submarino explodiu durante a missão.'
  : 'Submarine exploded during the mission.'
```

Não alterar o texto nem o callback da derrota por oxigênio.

- [ ] **Step 5: Executar o teste específico e confirmar sucesso**
