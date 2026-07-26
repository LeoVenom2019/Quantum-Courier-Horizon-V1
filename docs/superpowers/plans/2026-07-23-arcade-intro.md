# Arcade Intro Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restaurar a introdução audiovisual do fliperama com opção persistente para não exibi-la novamente.

**Architecture:** `GameDashboard` centraliza todas as solicitações de início e decide entre exibir a introdução ou iniciar a partida. Um componente dedicado renderiza o vídeo e devolve a preferência escolhida; `useSFX` continua responsável pelo áudio.

**Tech Stack:** React 19, TypeScript, Next.js, Node test runner, localStorage.

## Global Constraints

- Usar `/assets/games/fliper_intro.webm` e `/assets/games/flipers_sfx/intro_fliper.ogg`.
- A introdução aparece antes de cada partida enquanto “Não mostrar novamente” não for marcada.
- Preservar o fluxo de alerta de defesa do Capítulo 4.
- Não criar commit.

---

### Task 1: Gate e janela da introdução

**Files:**
- Create: `components/ArcadeIntroOverlay.tsx`
- Create: `lib/arcade-intro-flow.test.mjs`
- Modify: `components/GameDashboard.tsx`
- Modify: `hooks/useSFX.ts`
- Modify: `lib/asset-preloader.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: `playSfx('intro_fliper')`, `launchArcadeGame(id)`.
- Produces: `ArcadeIntroOverlay({ language, onContinue })` e o gate persistido `qch_skip_arcade_intro`.

- [ ] **Step 1: Write the failing test**

Criar um teste Node que confira arquivos, registro de SFX, preloader, componente, preferência e uso do gate pelos dois caminhos de entrada.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test lib/arcade-intro-flow.test.mjs`

Expected: FAIL porque `intro_fliper` não está registrado e a janela/gate não existem.

- [ ] **Step 3: Write minimal implementation**

Registrar o áudio, criar a janela com vídeo, checkbox e botões, e fazer seleção normal e confirmação após alerta passarem pelo mesmo gate antes de `launchArcadeGame`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test lib/arcade-intro-flow.test.mjs`

Expected: PASS.

- [ ] **Step 5: Verify project**

Run: testes Node registrados, `npx tsc --noEmit`, `npm run lint` e `npm run build`.

Expected: todos com exit code 0.
