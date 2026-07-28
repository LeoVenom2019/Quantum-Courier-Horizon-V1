# Explosão do submarino do jogador

## Objetivo

Quando o casco do submarino do jogador chegar a zero durante o combate submarino, mostrar uma explosão completa no próprio submarino antes de apresentar a derrota. Ao fim da animação, a interface deve exibir “Submarino explodido” e “GAME OVER”.

## Escopo

A mudança se aplica somente à derrota por casco destruído em `NewEarthUnderwaterBattle`. A derrota por oxigênio esgotado continua usando seu fluxo e sua mensagem próprios. A correção já pendente que remove as faixas horizontais da água deve ser preservada.

## Arquitetura

O estado interno da batalha ganha uma fase intermediária `player_exploding`, separada das fases `combat`, `exploration` e `defeat`.

Essa fase:

- impede movimento, disparos, colisões e novas alterações no resultado;
- mantém o laço de animação ativo para atualizar e desenhar água, bolhas, partículas e impactos;
- oculta o sprite, o rastro da hélice, a iluminação de giro e a mira do jogador;
- preserva o cenário no quadro durante a explosão;
- termina 1,2 segundo após seu início.

Não será criado um sistema novo de partículas. A explosão reutiliza `spawnImpact`, o mesmo gerador visual empregado quando um submarino inimigo é destruído, usando a posição do jogador, a cor vermelha, o modo de destruição e a escala já utilizada para inimigos.

## Fluxo de dados

1. Um torpedo inimigo reduz `state.player.hp` a zero.
2. O processamento de combate detecta a destruição uma única vez.
3. O jogo dispara `spawnImpact` no centro do jogador e toca um dos sons de `SUBMARINE_EXPLOSION_SFX`.
4. O motor constante do jogador é interrompido, seus tiros são removidos e a fase muda para `player_exploding`.
5. O instante final da animação é registrado como o tempo atual mais 1.200 ms.
6. Enquanto a fase estiver ativa, apenas os efeitos visuais continuam sendo atualizados e desenhados.
7. Ao atingir o instante final, a fase muda para `defeat`, o status React muda para `defeat` e `onDefeat` é chamado uma única vez.
8. O painel de derrota mostra “Submarino explodido” e, abaixo, “GAME OVER”.

## Interface e mensagens

Em português:

- título da derrota: `Submarino explodido`
- subtítulo: `GAME OVER`
- registro no painel principal: `Submarino explodiu durante a missão.`

Em inglês:

- título da derrota: `Submarine exploded`
- subtítulo: `GAME OVER`
- registro no painel principal: `Submarine exploded during the mission.`

A chamada de `onDefeat` ocorre somente depois da explosão. O overlay de derrota não aparece durante os 1,2 segundo da animação.

## Casos especiais

- A destruição é protegida contra execução duplicada, evitando múltiplos sons, explosões ou callbacks.
- Se o último inimigo e o jogador forem destruídos no mesmo quadro, a vitória já alcançada continua tendo precedência, preservando o comportamento atual.
- O esgotamento de oxigênio não usa a fase de explosão do casco e continua exibindo `Oxigênio esgotado`.
- A fase intermediária não aceita entrada de teclado ou mouse.

## Testes e verificação

Um teste de regressão por inspeção de fonte deve confirmar:

- a existência da fase `player_exploding`;
- o uso de `spawnImpact` na posição do jogador;
