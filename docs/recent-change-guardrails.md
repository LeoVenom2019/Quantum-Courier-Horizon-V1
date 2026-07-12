# Blindagem de Mudancas Recentes

Este arquivo registra ajustes recentes que sao intencionais e nao devem ser revertidos em limpezas, refactors ou troca de assets sem validacao visual.

## Historico / Capitulo 3

- O card `Dados perdidos no tempo` usa obrigatoriamente `/images/bobby_blue/bobby_blue_sad.webp`.
- Nao trocar para `.png`: o asset existente e esperado no projeto e `bobby_blue_sad.webp`.
- O asset tambem deve permanecer no preloader para a rota 3.

## Batalha Capitulo 3

- O som `/audio/sfx/player_airship_effect_sound.ogg` e o loop do motor da nave do jogador devem permanecer ativos na arena Void enquanto a batalha estiver rodando.
- O especial Hellfire Barrage v2 e intencional: 7 disparos, windup, finisher, hit-stop curto, shockwaves, scars, flash, camera punch, trilha com sparks/fumaca/brasas e burn zones reforcadas.
- A vida base dos inimigos do Capitulo 3 foi aumentada em 3x apenas em `hp` e `maxHp`; escudo, dano e recompensas nao devem ser multiplicados junto.

## Interface Capitulo 3

- Os cards de melhoria da nave de batalha tiveram tipografia aumentada para legibilidade. Evitar retornar os textos internos para tamanhos de 8px/9px.
