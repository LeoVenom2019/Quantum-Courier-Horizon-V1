# Robot Runner Ghost Death SFX Design

## Objetivo

Reproduzir `/assets/games/flipers_sfx/ghost_dead_rr.ogg` uma vez sempre que o jogador eliminar um fantasma no Robot Runner.

## Implementação

O áudio será registrado no mapa `SFX` interno do Robot Runner e chamado no ramo de `checkGhostCollisions()` que marca o fantasma como morto. O nome também será incluído na lista `fliperSfx` do preloader. Um teste estrutural verificará o arquivo, o registro, a chamada no evento correto e o preload.
