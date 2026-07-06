# Plano de estabilizacao da contabilidade de QC

## Objetivo

Centralizar a forma como o jogo credita, gasta e sincroniza QC para evitar bugs de saldo perdido, saldo duplicado ou divergencia entre a UI e o loop interno do jogo.

Este plano foca apenas em QC. Aetherion, residuos de mineracao, energia solar e tubos devem ficar fora desta primeira etapa para reduzir risco.

## Contexto atual

Hoje o saldo de QC vive em dois lugares ao mesmo tempo:

- `economy.qc` no Redux: saldo oficial consumido por UI, providers e reducers.
- `qcRef.current` no `GameDashboard`: copia mutavel usada pelo loop rapido do jogo.

Tambem existe `lastFlushedQcRef.current`, que serve como marcador para o `flushInterval` saber quanto da diferenca em `qcRef.current` ainda precisa ser enviada ao Redux.

Essa arquitetura hibrida funciona, mas e perigosa quando algum fluxo atualiza um lado e esquece o outro.

## Classes de bug que queremos eliminar

### 1. QC creditado na ref, mas nao no Redux no momento certo

Exemplo de risco:

```ts
qcRef.current += reward;
```

Se o Redux nao receber `EARN_QC` imediatamente, a UI pode continuar mostrando o saldo antigo ate o flush. Pior: outro sync pode sobrescrever a ref antes do credito ser consolidado.

### 2. QC creditado no Redux e tambem no flush

Exemplo de risco:

```ts
dispatch({ type: 'EARN_QC', payload: { amount, source } });
qcRef.current += amount;
```

Se `lastFlushedQcRef.current` nao for atualizado junto, o flush posterior enxerga uma diferenca em `qcRef.current` e credita o mesmo valor de novo.

### 3. Duas actions creditando a mesma operacao

Exemplo de risco:

```ts
dispatch({ type: 'EARN_QC', payload: { amount: value, source: 'extraction' } });
dispatch({ type: 'SELL_EXTRACTION_PACKS', payload: { value } });
```

Se `SELL_EXTRACTION_PACKS` tambem soma QC no reducer de economia, a venda entra duas vezes.

## Regra proposta

Todo fluxo de QC deve usar helpers locais no `GameDashboard`:

```ts
creditQc(amount, source)
spendQc(amount)
setQcBalance(amount)
```

Esses helpers devem ser o unico lugar que atualiza, ao mesmo tempo:

- `qcRef.current`
- `lastFlushedQcRef.current`
- Redux (`EARN_QC`, `SPEND_QC` ou `SET_QC`)

## Comportamento esperado dos helpers

### `creditQc(amount, source)`

Responsavel por creditar QC imediatamente.

Fluxo:

1. Normalizar `amount`.
2. Ignorar valores invalidos ou menores/iguais a zero.
3. Somar em `qcRef.current`.
4. Somar em `lastFlushedQcRef.current`.
5. Disparar `EARN_QC` no Redux.

Modelo:

```ts
const creditQc = useCallback((amount: unknown, source: QcSource) => {
  const safeAmount = normalizeGameNumber(amount);
  if (safeAmount <= 0) return 0;

  qcRef.current += safeAmount;
  lastFlushedQcRef.current += safeAmount;
  dispatch({ type: 'EARN_QC', payload: { amount: safeAmount, source } });

  return safeAmount;
}, [dispatch]);
```

### `spendQc(amount)`

Responsavel por gastar QC imediatamente.

Fluxo:

1. Normalizar `amount`.
2. Ignorar valores invalidos ou menores/iguais a zero.
3. Subtrair de `qcRef.current` sem ficar abaixo de zero.
4. Sincronizar `lastFlushedQcRef.current` com o novo valor.
5. Disparar `SPEND_QC` no Redux.

Modelo:

```ts
const spendQc = useCallback((amount: unknown) => {
  const safeAmount = normalizeGameNumber(amount);
  if (safeAmount <= 0) return 0;

  const spent = Math.min(qcRef.current, safeAmount);
  qcRef.current = Math.max(0, qcRef.current - spent);
  lastFlushedQcRef.current -= spent; // delta, igual ao creditQc — nao reatribuir
  dispatch({ type: 'SPEND_QC', payload: { amount: spent } });

  return spent;
}, [dispatch]);
```

> **Por que delta e nao reatribuicao:** `creditQc` mantem o invariante entre os dois refs somando o mesmo delta nos dois. Se `spendQc` fizer `lastFlushedQcRef.current = qcRef.current`, ele apaga silenciosamente qualquer divergencia acumulada entre os refs — exatamente o sinal que o `flushInterval` (Etapa 5) deveria usar para logar inconsistencias durante a migracao. Mantendo `-=`, o invariante so e resetado de forma explicita por `setQcBalance`.

### `setQcBalance(amount)`

Responsavel por setar o saldo absoluto.

Fluxo:

1. Normalizar `amount`.
2. Atualizar `qcRef.current`.
3. Atualizar `lastFlushedQcRef.current`.
4. Disparar `SET_QC` no Redux.

Modelo:

```ts
const setQcBalance = useCallback((amount: unknown) => {
  const safeAmount = Math.max(0, normalizeGameNumber(amount));

  qcRef.current = safeAmount;
  lastFlushedQcRef.current = safeAmount;
  dispatch({ type: 'SET_QC', payload: { amount: safeAmount } });
}, [dispatch]);
```

> Sem o `Math.max(0, ...)`, um bug upstream (por exemplo, um calculo errado no reset de campanha) poderia setar QC negativo sem nenhuma barreira. Se saldo negativo for um estado valido em algum fluxo especifico (ex: divida), documente a excecao explicitamente no call site em vez de remover o clamp do helper.

## Ordem de migracao recomendada

### Etapa 1: Criar helpers sem mudar comportamento

- Criar os helpers dentro de `DashboardContent`, perto dos setters atuais.
- Nao remover o `flushInterval` ainda.
- Rodar `npx tsc --noEmit`.

### Etapa 2: Migrar ganhos de QC

Substituir usos diretos de `qcRef.current +=` e `dispatch(EARN_QC)` em:

- entregas manuais e automaticas
- missoes
- mineracao automatica
- extracao automatica
- batalhas que dao QC
- recompensas da Nova Terra que dao QC

Cada caso deve usar `creditQc(amount, source)`.

### Etapa 3: Migrar gastos de QC

Substituir gastos diretos em:

- combustivel de rotas
- auto travel
- boosts
- compras feitas diretamente no `GameDashboard`

Cada caso deve usar `spendQc(amount)`.

### Etapa 4: Migrar setters absolutos

Substituir chamadas que zeram ou definem QC diretamente:

- inicio/reset de campanha
- entrada de rota/capitulo que seta saldo
- dev tools/botoes administrativos internos

Cada caso deve usar `setQcBalance(amount)`.

### Etapa 5: Revisar o `flushInterval`

Depois da migracao, o flush de QC deve deixar de ser o caminho principal.

Opcoes:

1. Remover apenas a parte de QC do flush, mantendo recursos.
2. Manter a parte de QC temporariamente como fallback, mas adicionar log de debug quando ela detectar diferenca.

Recomendacao: manter como fallback por uma versao, com comentario claro, e remover depois que a auditoria confirmar que nao existem escritas diretas em `qcRef`.

## Protecoes estruturais adicionais

Os helpers resolvem os bugs de classe 1 e 2 por construcao (unico ponto de escrita). O bug de classe 3 (duas actions creditando a mesma operacao) ainda depende de disciplina de code review. Duas protecoes baratas reduzem esse risco:

### Reducer como guarda-costas

Garantir que **apenas** `EARN_QC`, `SPEND_QC` e `SET_QC` alterem `economy.qc` no reducer de economia. Se alguma action como `SELL_EXTRACTION_PACKS` tambem somar QC diretamente no reducer, isso deveria falhar em um teste do reducer, nao depender de ser pego em revisao manual.

### Assertion de divergencia em modo dev

Apos cada helper rodar, comparar (apenas em ambiente de desenvolvimento) o valor esperado de `economy.qc` pos-dispatch com `qcRef.current` e emitir `console.warn` quando divergirem. Isso pega regressao em tempo real durante o desenvolvimento, sem esperar pelo checklist manual.

### Timers concorrentes durante `setQcBalance`

Ao trocar de capitulo ou resetar campanha (`setQcBalance`), intervals de auto-mineracao, auto-travel ou auto-claim que ainda estejam ativos podem chamar `creditQc` logo em seguida e vazar QC da sessao anterior para a nova. Garantir que esses intervals sejam limpos **antes** de `setQcBalance` rodar, ou usar uma flag de geracao/versao que os callbacks de timer verificam antes de creditar.

### Testes unitarios dos helpers

Os tres helpers sao logica pura (recebem `amount`, mexem em dois refs e um dispatch) e podem ser testados isoladamente sem subir o jogo inteiro: mockar `dispatch`, inicializar os refs, chamar `creditQc`/`spendQc`/`setQcBalance` e checar o estado final dos dois refs junto com o payload disparado. Isso complementa o checklist funcional manual, cobrindo regressao futura de forma automatizada.

## Checklist de busca

Depois da migracao, estas buscas devem retornar zero ou apenas casos justificados:

```powershell
rg -n "qcRef\.current \+=" components/GameDashboard.tsx
rg -n "qcRef\.current -=" components/GameDashboard.tsx
rg -n "dispatch\(\{ type: 'EARN_QC'" components/GameDashboard.tsx
rg -n "dispatch\(\{ type: 'SPEND_QC'" components/GameDashboard.tsx
rg -n "dispatch\(\{ type: 'SET_QC'" components/GameDashboard.tsx
```

As excecoes aceitaveis devem estar dentro dos helpers.

**Importante:** as buscas acima cobrem apenas `GameDashboard.tsx`. Como o proprio plano observa (secao Riscos) que algumas rotas ainda usam `DashboardProvider`, e possivel que actions de QC sejam disparadas de sagas, thunks ou outros componentes fora desse arquivo. Rode tambem a busca sem escopo, no repositorio inteiro, antes de considerar a auditoria concluida:

```powershell
rg -n "type: 'EARN_QC'|type: 'SPEND_QC'|type: 'SET_QC'" --type ts
```

Zero resultados em `GameDashboard.tsx` nao significa migracao completa se essa busca ampla ainda encontrar disparos em outro lugar.

## Checklist funcional manual

Testar estes fluxos antes de considerar a mudanca pronta:

1. Cap 1: lancar entrega Terra, esperar concluir, confirmar aumento imediato do saldo.
2. Cap 1: comprar algo logo apos uma entrega, confirmar que o saldo usado e o saldo exibido batem.
3. Cap 2: entrega interestelar manual, confirmar credito.
4. Cap 2: auto travel, confirmar credito e gasto de combustivel/AE.
5. Mineracao manual, confirmar credito unico.
6. Mineracao automatica, confirmar credito unico.
7. Extracao manual, confirmar credito unico e packs zerados.
8. Extracao automatica, confirmar credito unico e packs zerados.
9. Missao concluida manualmente, confirmar credito unico.
10. Auto claim de missao, confirmar credito unico e gasto correto de Aetherion.

## Riscos

- Alterar muitos fluxos de uma vez pode esconder regressao.
- Algumas rotas ainda usam `DashboardProvider`, enquanto o loop de entrega vive no `GameDashboard`.
- O `flushInterval` ainda sincroniza outros recursos; nao deve ser removido por completo nesta etapa.

## Criterio de pronto

A mudanca e considerada segura quando:

- `npx tsc --noEmit` passa.
- ESLint dos arquivos alterados nao tem erro novo.
- Buscas por escrita direta em `qcRef` mostram apenas helpers, tanto em `GameDashboard.tsx` quanto na busca ampla no repositorio.
- O reducer de economia so altera `economy.qc` a partir de `EARN_QC`, `SPEND_QC` ou `SET_QC`.
- Os 10 fluxos manuais do checklist passam.
- Nenhum fluxo credita QC por duas actions diferentes para a mesma operacao.

## Decisao recomendada

Prosseguir com a centralizacao de QC em helpers locais no `GameDashboard`, mantendo o escopo restrito a QC.

Nao recomendo migrar Aetherion e outros recursos agora. Primeiro estabilizamos a moeda principal; depois repetimos o padrao para os demais recursos se o resultado ficar confiavel.