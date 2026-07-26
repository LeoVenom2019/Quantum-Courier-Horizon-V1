# Robot Runner Ghost Death SFX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tocar `ghost_dead_rr.ogg` quando um fantasma for eliminado no Robot Runner.

**Architecture:** O minijogo continuará usando seu cache e função `playSfx` locais. O novo caminho será adicionado ao mapa `SFX`, acionado no ramo `player.isPowered` da colisão e registrado no preloader global.

**Tech Stack:** JavaScript, Node test runner, preloader TypeScript.

## Global Constraints

- Usar `/assets/games/flipers_sfx/ghost_dead_rr.ogg`.
- Tocar uma vez por fantasma eliminado.
- Incluir o áudio no grupo de preload dos fliperamas.
- Não criar commit.

---

### Task 1: Integrar e blindar o áudio

**Files:**
- Create: `lib/robot-runner-ghost-sfx.test.mjs`
- Modify: `public/mini-games/robot-runner/script.js`
- Modify: `lib/asset-preloader.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: `playSfx(path, volume)` do Robot Runner.
- Produces: `SFX.ghostDead` e teste `test:robot-runner-ghost-sfx`.

- [ ] **Step 1: Criar teste que exige arquivo, registro, chamada e preload**

- [ ] **Step 2: Executar `node --test lib/robot-runner-ghost-sfx.test.mjs` e confirmar falha**

- [ ] **Step 3: Registrar `ghostDead`, chamar `playSfx(SFX.ghostDead)` após `g.dead = true` e adicionar `ghost_dead_rr` ao preloader**

- [ ] **Step 4: Executar o teste novamente e confirmar aprovação**

- [ ] **Step 5: Executar testes do projeto, TypeScript, lint e build**
