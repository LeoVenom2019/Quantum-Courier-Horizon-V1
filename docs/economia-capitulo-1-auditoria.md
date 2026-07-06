# Auditoria da economia do Capitulo 1

## Objetivo

Documentar como a economia do Capitulo 1 esta hoje no codigo, antes de aplicar qualquer rebalanceamento. A ideia e criar uma base comum para comparar fontes de renda, custos e multiplicadores sem quebrar fluxos que ja estao funcionais.

Este documento cobre apenas o Capitulo 1 / tier `Solar`. O Capitulo 2 deve ser analisado em documento separado porque tem multiplicadores proprios, pontos de extracao, escala de batalha diferente e efeitos de nivel de batalha que mudam bastante a economia.

## Fontes analisadas

- `lib/game-data.ts`: rotas, naves, tecnologias, minerios e upgrades.
- `lib/game-constants.ts`: multiplicadores globais e custos especiais.
- `components/GameDashboard.tsx`: loop real de entregas, geracao de missoes, batalhas, auto-entrega e auto-venda.
- `components/dashboard/DashboardProvider.tsx`: compras, venda manual de minerio, producao passiva de minerio e alguns fluxos de UI.
- `components/dashboard/BattleLevelTab.tsx`: custos exibidos de batalha/radar.

## Regra geral do Capitulo 1

No tier `Solar`, os multiplicadores economicos globais retornam:

| Multiplicador | Valor atual | Observacao |
| --- | ---: | --- |
| `profit` | 1x | Usado em entrega, mineracao e missoes. |
| `cost` | 1x | Usado em compras principais. |
| `battleProfit` | 1x | Usado como base para recompensa de batalha. |

Ou seja: no Capitulo 1, a economia nao esta inflada por multiplicador global. Os picos de renda vem de multiplicadores locais: upgrades de valor, entrega rara, entrega perfeita, missoes raras, compressao de mineracao e batalhas boss/elite.

## Saldo inicial

| Item | Valor |
| --- | ---: |
| QC inicial | 100 |
| Primeira nave nivel 1 | gratis |
| Primeira tecnologia Solar nivel 1 | gratis |
| Primeira rota Terra | desbloqueada/inicial |

## Rotas de entrega Solar

| Rota | Nivel nave | Recompensa base | Custo desbloqueio | Auto slot base | Risco |
| --- | ---: | ---: | ---: | ---: | ---: |
| Terra | 1 | 2.500 | 0 | 500 | 0,1% |
| Lua | 2 | 7.500 | 5.000 | 1.500 | 1% |
| Venus | 3 | 25.000 | 25.000 | 5.000 | 8% |
| Marte | 4 | 100.000 | 100.000 | 20.000 | 5% |
| Mercurio | 5 | 400.000 | 500.000 | 80.000 | 12% |
| Jupiter | 6 | 1.500.000 | 2.500.000 | 300.000 | 15% |
| Saturno | 7 | 5.000.000 | 12.500.000 | 1.000.000 | 18% |
| Urano | 8 | 15.000.000 | 50.000.000 | 3.000.000 | 22% |
| Netuno | 9 | 50.000.000 | 250.000.000 | 10.000.000 | 25% |

### Formula de recompensa de entrega

No loop real do `GameDashboard`:

```text
reward = route.reward
       * (1 + upgradeValor)
       * profit
       * bonusEntregaPerfeita
       * bonusEntregaRara
```

No Capitulo 1, `profit = 1`.

| Bonus | Valor atual |
| --- | ---: |
| Entrega perfeita normal | 1,5x |
| Chance perfeita base | 10% |
| IA nivel 6 | 100% sucesso + 50% chance perfeita |
| Entrega rara | 5x |
| Chance rara base | 5% |
| Chance rara max | 35% |

Observacao critica: o texto do upgrade raro fala em "10x", mas o codigo aplica `5x`. Isso nao quebra a economia, mas quebra expectativa de jogador e dificulta balanceamento.

### Upgrades de valor de entrega

| Nivel | Custo base | Bonus lucro | Multiplicador final de rota |
| ---: | ---: | ---: | ---: |
| 1 | 10.000 | +50% | 1,5x |
| 2 | 100.000 | +100% | 2x |
| 3 | 1.000.000 | +150% | 2,5x |
| 4 | 10.000.000 | +300% | 4x |
| 5 | 100.000.000 | +500% | 6x |

Com valor nivel 5, rara e perfeita, uma entrega pode chegar a:

```text
route.reward * 6 * 5 * 1,5 = route.reward * 45
```

Exemplo extremo no Capitulo 1:

| Rota | Base | Max teorico por entrega |
| --- | ---: | ---: |
| Terra | 2.500 | 112.500 |
| Netuno | 50.000.000 | 2.250.000.000 |

Esse pico pode ser aceitavel como evento premium se for raro e caro de preparar, mas e um ponto de atencao porque compete diretamente com missoes e batalhas.

## Custos de progressao principal

### Tecnologias Solar

| Nivel | Custo | Tempo pesquisa |
| ---: | ---: | ---: |
| 1 | 0 | 0 min |
| 2 | 5.000 | 5 min |
| 3 | 25.000 | 10 min |
| 4 | 100.000 | 15 min |
| 5 | 500.000 | 30 min |
| 6 | 2.500.000 | 45 min |
| 7 | 12.500.000 | 60 min |
| 8 | 50.000.000 | 120 min |
| 9 | 250.000.000 | 240 min |

Boost de pesquisa custa `75%` do custo da tecnologia.

### Naves Solar

A primeira nave de cada nivel e gratis. Copias extras custam:

| Nivel | Nave | Custo copia extra |
| ---: | --- | ---: |
| 1 | Atlas Courier | 500 |
| 2 | Lunar Runner | 10.000 |
| 3 | Solar Swift | 50.000 |
| 4 | Red Horizon | 200.000 |
| 5 | Helios Freighter | 1.000.000 |
| 6 | Jovian Hauler | 5.000.000 |
| 7 | Titan Carrier | 25.000.000 |
| 8 | Void Strider | 100.000.000 |
| 9 | Neptune Vanguard | 500.000.000 |

Limite atual: 5 naves por nivel.

### Upgrades por rota/nave

Os custos de upgrade sao multiplicados por `getLocationMultiplier(locationId)`.

Hoje esse multiplicador usa:

```text
1 + progression.unlockedTechLevels[locationId] * 0,1
```

Risco: `unlockedTechLevels` normalmente parece indexado por tier (`Solar`) e nao por rota (`terra`, `lua`, etc). Se nao houver valores por `locationId`, o multiplicador efetivo fica sempre `1`. Isso precisa ser confirmado em teste, porque pode deixar upgrades mais baratos do que o design pretendia.

#### Motor

| Nivel | Custo base | Efeito |
| ---: | ---: | --- |
| 1 | 5.000 | +25% velocidade |
| 2 | 25.000 | +50% velocidade |
| 3 | 100.000 | +75% velocidade |
| 4 | 500.000 | +100% velocidade |
| 5 | 2.500.000 | entrega quase instantanea |

Motor nivel 5 exige 5 slots automaticos naquela rota.

#### IA

| Nivel | Custo base | Efeito |
| ---: | ---: | --- |
| 1 | 5.000 | 75% sucesso auto |
| 2 | 25.000 | 80% sucesso auto |
| 3 | 100.000 | 85% sucesso auto |
| 4 | 500.000 | 90% sucesso auto |
| 5 | 2.500.000 | 100% sucesso auto |
| 6 | 12.500.000 | 100% sucesso + 50% perfeita |

#### Entrega rara

| Nivel | Custo base | Chance |
| ---: | ---: | ---: |
| 1 | 20.000 | 10% |
| 2 | 200.000 | 15% |
| 3 | 2.000.000 | 20% |
| 4 | 20.000.000 | 25% |
| 5 | 200.000.000 | 35% |

Ponto critico: tooltip diz `10x`, codigo aplica `5x`.

## Auto-entrega

### Compra de slots

| Slot | Custo base |
| ---: | ---: |
| 1 | 1.000 |
| 2 | 5.000 |
| 3 | 10.000 |
| 4 | 15.000 |
| 5 | 20.000 |

Formula:

```text
custoSlot = slotCost[currentSlots] * getLocationMultiplier(routeId) * cost
```

No Capitulo 1, `cost = 1`.

### Custo por tentativa automatica

No `GameDashboard`, cada tentativa automatica cobra:

```text
fuelCost = floor(10 * (1 + upgradeValor * 0,1))
attemptCost = fuelCost * numeroDeSlots
aetherionTripCost = numeroDeSlots * 2
```

Manual tambem cobra combustivel, exceto quando o jogador tem 0 QC e usa nave nivel 1.

Ponto de balanceamento: o custo de combustivel e muito baixo perto das recompensas a partir de Lua/Venus. Ele funciona mais como pequeno freio inicial do que como dreno economico real.

## Mineracao Solar

### Minerios

| Minerio | Nivel nave | Valor base | Pack | Valor pack bruto | Venda atual com `MINING_VALUE_MULTIPLIER=0,5` | Robo base | Auto-venda |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Ferrita | 1 | 50 | 50 | 2.500 | 1.250 | 5.000 | 50.000 |
| Quartzo | 2 | 150 | 50 | 7.500 | 3.750 | 15.000 | 75.000 |
| Niquel | 3 | 500 | 50 | 25.000 | 12.500 | 50.000 | 150.000 |
| Cobalto | 4 | 2.000 | 50 | 100.000 | 50.000 | 200.000 | 350.000 |
| Titanio | 5 | 8.000 | 50 | 400.000 | 200.000 | 800.000 | 800.000 |
| Plasma | 6 | 30.000 | 50 | 1.500.000 | 750.000 | 3.000.000 | 2.000.000 |
| Eter | 7 | 100.000 | 50 | 5.000.000 | 2.500.000 | 10.000.000 | 5.000.000 |
| Materia | 8 | 300.000 | 50 | 15.000.000 | 7.500.000 | 30.000.000 | 15.000.000 |
| Nucleo | 9 | 1.000.000 | 50 | 50.000.000 | 25.000.000 | 100.000.000 | 50.000.000 |

### Producao passiva

No `DashboardProvider`, mineracao passiva roda a cada 500ms:

```text
producaoPorSegundo = robos * (0,5 * speedBonus * efficiencyBonus * productionBonus)
adicaoPorTick = producaoPorSegundo * 0,5
```

Com 1 robo:

| Nivel robo | Multiplicador efetivo | Packs por minuto aproximado |
| ---: | ---: | ---: |
| 1 | 1,00x | 0,60 pack/min |
| 2 | 1,25x | 0,75 pack/min |
| 3 | 1,875x | 1,125 packs/min |
| 4 | 3,28125x | 1,969 packs/min |
| 5 | 3,75x | 2,25 packs/min |

Com 5 robos nivel 5 no mesmo minerio, a producao chega perto de `11,25 packs/min`.

### Compressao de minerio

Venda manual usa:

```text
compressionBonus = 1 + nivelCompressao * 0,2
```

Auto-venda no `GameDashboard` usa:

```text
compressionBonus = 1 + nivelCompressao * 0,5
```

Ponto critico: manual e auto usam bonus de compressao diferente. Isso pode fazer a auto-venda ser economicamente superior demais em relacao a venda manual, principalmente no mid/late Capitulo 1.

### Custos de mineracao

| Sistema | Formula atual |
| --- | --- |
| Comprar robo | `robotBaseCost * 1,1^robosAtuais` |
| Melhorar robo | `robotBaseCost * costMultiplierDoNivel` |
| Compressao | `robotBaseCost * 1,6681^nivelAtual` |
| Auto-venda | `autoSellCost` |

Upgrades de robo:

| Nivel alvo | Cost multiplier | Speed | Efficiency | Production |
| ---: | ---: | ---: | ---: | ---: |
| 2 | 5x | 1,25x | 1x | 1x |
| 3 | 25x | 1,25x | 1,5x | 1x |
| 4 | 100x | 1,25x | 1,5x | 1,75x |
| 5 | 500x | 1,25x | 1,5x | 2x |

Ponto de atencao: a mineracao parece bem baixa no inicio se comparada a entrega manual. Ela vira relevante com varios robos, compressao e auto-venda; antes disso, funciona mais como complemento e geradora de residuos.

## Missoes Solar

### Missoes iniciais

Existem 6 missoes iniciais no Capitulo 1:

| Missao | Gatilho | Recompensa |
| --- | --- | ---: |
| init_1 | tecnologia inicial | 1.000 |
| init_2 | comprar nave Atlas | 1.000 |
| init_3 | motor nivel 1 na Terra | 1.000 |
| init_4 | iniciar primeira entrega manual | 1.000 |
| init_5 | comprar primeiro slot automatico | 1.000 |
| init_6 | comprar primeiro robo Ferrita | 1.000 |

Essas recompensas sao pequenas e funcionam como tutorial, nao como fonte principal.

### Missoes dinamicas

Valor base por nivel de recompensa:

| Nivel | Base antes do nerf Solar | Base efetiva Solar (`0,3x`) |
| ---: | ---: | ---: |
| 1 | 15.000 | 4.500 |
| 2 | 50.000 | 15.000 |
| 3 | 250.000 | 75.000 |
| 4 | 1.250.000 | 375.000 |
| 5 | 7.500.000 | 2.250.000 |
| 6 | 40.000.000 | 12.000.000 |
| 7 | 200.000.000 | 60.000.000 |
| 8 | 1.000.000.000 | 300.000.000 |
| 9 | 4.000.000.000 | 1.200.000.000 |
| 10 | 10.000.000.000 | 3.000.000.000 |

Recompensa final:

```text
reward = floor(baseEfetiva * rarityMultiplier * random(0,8 a 1,2))
```

Multiplicadores de raridade no Solar:

| Raridade | Multiplicador | Chance base |
| --- | ---: | ---: |
| Comum | 1x | 70% menos upgrades de raridade |
| Rara | 10x | 30% |
| Lendaria | 25x | depende de upgrade/skill |
| Mitica | 35x | depende de upgrade/skill |
| Alien | 50x | depende de upgrade/skill |

Ponto critico: mesmo com o nerf Solar de `0,3x`, uma missao alien nivel 10 pode pagar em torno de `150B QC` antes da variacao aleatoria. Isso e muito acima da recompensa base de Netuno e pode se tornar a fonte dominante se o jogador empilhar upgrade de recompensa e raridades.

### Custo do upgrade de recompensa de missao

No `GameDashboard`, custo Solar:

| Nivel atual -> proximo | Custo |
| --- | ---: |
| 0 -> 1 | 2.500 |
| 1 -> 2 | 15.000 |
| 2 -> 3 | 100.000 |
| 3 -> 4 | 500.000 |
| 4 -> 5 | 2.500.000 |
| 5 -> 6 | 10.000.000 |
| 6 -> 7 | 40.000.000 |
| 7 -> 8 | 150.000.000 |
| 8 -> 9 | 500.000.000 |
| 9 -> 10 | 2.000.000.000 |

Risco tecnico: `DashboardProvider` tem outra formula para esse custo (`5000 * 2^level` para Solar), diferente do `GameDashboard`. A UI atual provavelmente usa o provider em alguns contextos e o dashboard em outros. Isso precisa ser unificado antes do rebalance final, senao o mesmo upgrade pode ter custo diferente dependendo do caminho.

### Alvos de missoes

| Tipo | Alvo Solar |
| --- | ---: |
| Entrega | 20 entregas, reduzivel ate 5 por skill |
| Venda de minerio | 10 packs, reduzivel ate 5 por skill |

Ponto de atencao: uma missao de venda pode pedir apenas 10 packs, mas em raridades altas pode pagar mais que varias rotas de entrega. Isso pode fazer mineracao ser usada nao pela venda do minerio, mas como gatilho barato de missao.

## Batalhas Solar

### Custo de evoluir nivel de batalha

Max Solar: nivel 25.

Formula:

```text
custoNivel = floor(1000 * 50000^((proximoNivel - 1) / 24))
```

Isso cria uma curva exponencial de `1.000` ate aproximadamente `50.000.000`.

### Radar

| Nivel atual | Custo upgrade |
| ---: | ---: |
| 0 | 5.000 |
| 1 | 25.000 |
| 2 | 100.000 |
| 3 | 500.000 |
| 4 | 2.500.000 |
| 5 | 10.000.000 |
| 6 | 50.000.000 |
| 7 | 250.000.000 |

Chance de encontrar inimigo:

```text
50% + radarLevel * 5%
```

Cooldown base: 60s. A partir do nivel de batalha 5, cai para 30s.

### Recompensa de batalha

Formula vista no `GameDashboard`:

```text
reward = route.reward
       * (0,5 + enemyTier * 0,1)
       * tipoInimigo
       * battleProfit
       * rewardMultiplier
```

No Solar, `battleProfit = 1`.

Multiplicadores:

| Caso | Multiplicador interno | Reward multiplier | Total aproximado |
| --- | ---: | ---: | ---: |
| Normal | 1x | 1x | 1x |
| Elite | 2x | 3x | 6x |
| Boss | 5x | 6x | 30x |

Ponto critico: boss pode pagar cerca de `route.reward * (0,5 + tier*0,1) * 30`. Em batalha nivel 25, isso da `route.reward * 90`. Em Netuno, isso chega a `4,5B QC` em uma vitoria boss. Pode ser aceitavel como fonte de risco, mas precisa ser comparado com missoes raras e entrega rara.

## Comparacao inicial de fontes

Esta tabela e qualitativa, porque a renda por minuto depende de tempo de entrega, quantidade de naves, slots, nivel de motor e disponibilidade de missoes.

| Fonte | Inicio Cap 1 | Meio Cap 1 | Fim Cap 1 | Risco de dominar |
| --- | --- | --- | --- | --- |
| Entrega manual | Alta | Media | Media/Alta com upgrades | Medio |
| Auto-entrega | Baixa ate comprar slots | Alta com IA/motor | Muito alta com muitos slots | Alto |
| Mineracao manual | Baixa | Media | Alta com robos/compressao | Medio |
| Mineracao auto | Baixa | Alta | Muito alta se compressao auto ficar 0,5/level | Alto |
| Missoes iniciais | Baixa | Irrelevante | Irrelevante | Baixo |
| Missoes dinamicas comuns | Media | Alta | Alta | Medio |
| Missoes dinamicas raras/alien | Alta demais em niveis altos | Muito alta | Pode quebrar economia | Muito alto |
| Batalhas comuns | Baixa/Media | Media | Alta | Medio |
| Batalhas boss | Alta | Muito alta | Pode competir com missoes raras | Alto |

## Principais suspeitas de desbalanceamento

### 1. Missoes raras em nivel alto podem ultrapassar o teto do Capitulo 1

O multiplicador `Alien 50x` em cima de uma base Solar nivel 10 de `3B` cria recompensas perto de `150B`. Isso parece fora da escala das rotas Solar, mesmo considerando que o upgrade custa `2B` para chegar ao nivel 10.

Minha leitura: este e o maior candidato a quebrar a economia do Capitulo 1.

### 2. Compressao manual e auto-venda usam formulas diferentes

Manual: `+20% por nivel`.

Auto: `+50% por nivel`.

Isso pode fazer a automacao nao apenas economizar clique, mas tambem pagar muito mais. Para jogo premium, automacao pode ser poderosa, mas precisa ter custo e retorno previsiveis.

### 3. Texto de entrega rara nao bate com o codigo

UI fala `10x`, codigo aplica `5x`.

Isso nao e exatamente economia quebrada, mas e quebra de confianca e atrapalha qualquer decisao de balanceamento.

### 4. Custo de upgrade de recompensa de missao esta duplicado

`GameDashboard` usa tabela manual.

`DashboardProvider` usa formula exponencial simples.

Antes de rebalancear numeros, esse caminho precisa virar fonte unica de verdade.

### 5. `getLocationMultiplier(routeId)` talvez nao esteja funcionando como pretendido

Se `unlockedTechLevels` nao tiver chaves por rota, os upgrades por rota ficam sem escalonamento local. Isso deixa upgrades de rotas finais relativamente baratos diante das recompensas finais.

### 6. Custo de combustivel e praticamente irrelevante depois do inicio

O custo de `10 QC` por tentativa e bom para nao travar o tutorial, mas nao atua como dreno economico em rotas posteriores. Se a intencao for manter um dreno leve e simbolico, tudo bem. Se a intencao for criar decisao economica, esta baixo.

## O que parece abaixo do ideal

### Mineracao inicial

Ferrita com 1 robo nivel 1 gera cerca de `0,6 pack/min`, e cada pack vendido vale `1.250 QC`. Isso da perto de `750 QC/min` por robo antes de compressao. Comparado a uma entrega Terra de `2.500 QC`, a mineracao inicial parece lenta, mesmo custando `5.000 QC` por robo.

Isso pode ser intencional se mineracao for renda passiva secundaria. Mas se a aba de mineracao deve competir como fonte real desde cedo, ela esta baixa no comeco.

### Missoes iniciais

Cada uma paga `1.000 QC`. Elas ajudam no onboarding, mas nao criam aquele impacto premium de "completei objetivo, senti progresso". Talvez esteja ok por serem tutoriais, mas e um ponto de sensacao.

## O que parece acima do ideal

### Missoes alien/miticas em recompensa alta

O teto de missao Solar parece muito maior que o teto natural das rotas.

### Batalha boss em rota final

Boss de Netuno em nivel de batalha alto pode pagar bilhoes. Pode ser bom se for raro e perigoso, mas se radar/auto-skip tornar isso frequente, vira fonte dominante.

### Auto-venda com compressao de 0,5 por nivel

Esse ponto precisa ser simulado. A diferenca contra venda manual pode ficar grande demais.

## Recomendacao para a proxima etapa

Antes de editar numeros, eu recomendo montar uma matriz de alvo por fase do Capitulo 1:

| Fase | Rotas esperadas | Fonte principal desejada | Fonte secundaria | Teto de recompensa aceitavel |
| --- | --- | --- | --- | --- |
| Inicio | Terra, Lua, Venus | Entrega manual | Missoes iniciais/mineracao leve | baixo |
| Meio | Marte, Mercurio, Jupiter | Entrega + auto-entrega | Mineracao | medio |
| Fim | Saturno, Urano, Netuno | Mix entre auto, mineracao, batalha | Missoes raras como bonus | alto, mas controlado |

Depois disso, a ordem mais segura de balanceamento seria:

1. Unificar formulas duplicadas antes de mexer em valores.
2. Definir teto de recompensa por fase.
3. Ajustar missoes dinamicas, principalmente multiplicadores raros/alien.
4. Corrigir compressao manual vs auto.
5. Validar entrega rara: ou mudar texto para 5x, ou codigo para 10x com reducao de chance/custo.
6. Simular renda por minuto com 1, 3 e 5 naves/slots/robos por fase.

## Estado do documento

Este documento e uma auditoria inicial, nao um patch de balanceamento. Nenhum valor de economia foi alterado nesta etapa.
