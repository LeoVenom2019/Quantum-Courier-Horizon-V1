# Arcade Intro Design

## Objetivo

Restaurar a introdução audiovisual antes de cada partida do fliperama e permitir que o jogador a desative permanentemente.

## Fluxo

Toda solicitação de partida passa por um único gate no dashboard. Se a preferência persistida `qch_skip_arcade_intro` não estiver ativa, uma janela sobre a tela do fliperama reproduz `/assets/games/fliper_intro.webm` e dispara `intro_fliper` uma única vez. Ao terminar o vídeo ou usar o botão de entrada, o jogo solicitado é iniciado. O botão de pular também inicia o jogo imediatamente.

A janela contém a marcação “Não mostrar novamente”. Quando marcada, a preferência é salva em `localStorage`; partidas futuras seguem diretamente para o jogo. O vídeo fica sem áudio próprio para que o volume e a preferência global de efeitos sonoros continuem controlados pelo sistema `useSFX`.

## Blindagem

Um teste estrutural confere a existência dos dois arquivos, registro do efeito, presença no preloader, gate central, preferência persistida e renderização da janela.
