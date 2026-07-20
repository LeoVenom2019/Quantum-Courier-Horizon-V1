# Capítulos 1 e 2 — batalhas, resultados e áudio

## Objetivo

Modernizar as telas de vitória e derrota das batalhas manuais dos capítulos 1 (Solar) e 2 (Interestelar), integrar os sete novos áudios e manter as resoluções automáticas sem alterações visuais ou sonoras.

## Escopo

- Aplicar a nova experiência apenas quando a batalha pertence às rotas `Solar` ou `Interstellar` e não foi iniciada como entrega automática (`deliveryId` com prefixo `auto-`).
- Preservar o fluxo, recompensas, progressão e fechamento de batalha existentes.
- Não adicionar vídeos, imagens ou novos assets além dos sete arquivos `.ogg` já presentes em `public/audio/solar_interestelar`.
- Não modificar telas de resultados dos capítulos 3 e 4.

## Direção visual

A tela será um relatório de missão com HUD holográfico, seguindo a linguagem visual do QCH. O impacto virá de composição, tipografia, bordas técnicas, gradientes, linhas de varredura discretas e animações curtas em CSS/Motion.

- Vitória Solar: paleta âmbar/dourada, halo radial leve e detalhes que lembram leitura de energia estelar.
- Vitória Interestelar: paleta ciano/violeta, grade técnica e sensação de profundidade espacial.
- Derrota compartilhada: paleta carmesim/vermelha, sinal de telemetria interrompido e movimentos mais contidos.
- Estrutura: identificação do capítulo e estado da missão, título principal, adversário/setor, painel de recompensas quando houver vitória e ação primária para continuar.
- Responsividade: painel utilizável em telas pequenas, com recompensas reorganizadas sem overflow.
- Desempenho: não usar `backdrop-blur`, filtros animados, vídeos, imagens de fundo, grandes áreas com blur nem grandes quantidades de partículas. As animações devem atuar principalmente em opacidade, transformação e sombras discretas.
- Acessibilidade: respeitar `prefers-reduced-motion` por meio das capacidades do Motion/CSS, manter contraste legível e botão de continuação claramente identificável.

## Arquitetura da interface

O resultado manual Solar/Interestelar será isolado em um componente próprio, evitando aumentar o ramo genérico de `BattleOverlay`. O overlay atual permanece como fallback para batalhas automáticas e demais capítulos.

O componente recebe somente os dados necessários: resultado, capítulo, idioma, dados do inimigo, recompensas, formatador e callback de continuação. A decisão sobre usar a nova tela será explícita e testável por uma função pura, baseada no capítulo, estado final e origem manual/automática.

## Fluxo de áudio

### Início e duração da batalha manual

- Solar escolhe uma vez, com distribuição uniforme, entre:
  - `start_solar_battle_01.ogg`
  - `start_solar_battle_02.ogg`
- Interestelar escolhe uma vez, com distribuição uniforme, entre:
  - `start_interestelar_battle_01.ogg`
  - `start_interestelar_battle_02.ogg`
- O tema escolhido começa ao entrar na arena manual, substitui temporariamente a música normal da rota e permanece em loop durante a batalha.
- A escolha não muda durante re-renderizações.

### Resultado

- Ao encerrar a luta, o tema de batalha para imediatamente.
- Vitória Solar toca uma vez `solar_battle_victory_theme.ogg`.
- Vitória Interestelar toca uma vez `interestelar_battle_victory_theme.ogg`.
- Derrota em qualquer um dos dois capítulos toca uma vez `cap_0102_battlelost_theme.ogg`.
- Ao fechar o resultado ou desmontar o fluxo, o áudio local é interrompido e a música normal da rota é retomada quando a música estiver habilitada.
- Volume e estado ligado/desligado respeitam as configurações de música do jogo. Falhas de autoplay são ignoradas nos mesmos casos já tratados pelo projeto (`AbortError` e `NotAllowedError`).
- Batalhas automáticas não acionam nenhum desses áudios.

## Jukebox

Os quatro temas de batalha serão adicionados à biblioteca, agrupados nos capítulos correspondentes, com identificadores únicos e títulos legíveis:

- Solar Battle I
- Solar Battle II
- Interstellar Battle I
- Interstellar Battle II

Os dois temas de vitória e o efeito de derrota não serão adicionados à jukebox.

## Preloader e proteção dos assets

- Os dois temas de batalha Solar e o tema de vitória Solar entram no grupo `route1`.
- Os dois temas de batalha Interestelar e o tema de vitória Interestelar entram no grupo `route2`.
- O efeito de derrota compartilhado entra em `route1` e `route2`, garantindo disponibilidade em ambos.
- As URLs também ficam centralizadas em constantes de código usadas pelo runtime. Essas referências estáticas, somadas às entradas do preloader e da jukebox, impedem que os arquivos se tornem assets órfãos durante futuras limpezas do projeto.

## Testes e verificação

- Testar a regra que habilita o novo resultado somente para batalhas manuais Solar/Interestelar.
- Testar a seleção uniforme dos dois temas usando valores determinísticos do gerador aleatório.
- Testar o mapeamento de vitória/derrota para o áudio correto e garantir que resultados automáticos não recebam áudio local.
- Testar que os quatro temas de batalha aparecem na biblioteca e que temas de vitória/derrota não aparecem.
- Testar que os sete assets esperados estão cobertos pelos grupos corretos do preloader.
- Executar TypeScript, ESLint e build de produção após a implementação.
- Fazer inspeção visual das telas Solar, Interestelar e derrota em desktop e viewport pequeno, verificando ausência de overflow e de blur pesado.

## Critérios de aceite

1. Batalhas manuais Solar e Interestelar sorteiam corretamente um dos dois temas do capítulo.
2. Novas telas de vitória e derrota aparecem apenas nessas batalhas manuais.
3. Vitória e derrota tocam exatamente o áudio solicitado, sem entrar na jukebox.
4. Resoluções automáticas continuam com o comportamento atual.
5. Os quatro temas de batalha ficam disponíveis na jukebox.
6. Todos os sete arquivos estão referenciados no preloader e no runtime.
7. A interface é moderna, consistente com o QCH, responsiva e sem efeitos pesados de blur.
