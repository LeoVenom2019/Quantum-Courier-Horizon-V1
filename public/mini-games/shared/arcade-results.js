(function () {
  const GAME_ASSETS = {
    'danger-zoom-zones': { folder: 'danger_zoom_zones', file: 'danger_zoom_zones' },
    'grid-collapse': { folder: 'grid_collapse', file: 'grid_collapse' },
    'neo-catcher': { folder: 'neo_catcher', file: 'neo_catcher' },
    'robot-runner': { folder: 'robot_runner', file: 'robot_runner' },
    'ruptura-estelar': { folder: 'ruptura_estelar', file: 'ruptura_estelar' },
    'salto-espacial': { folder: 'salto_espacial', file: 'salto_espacial' },
  };

  const getLanguage = () => {
    const lang = (document.documentElement.lang || navigator.language || 'pt').toLowerCase();
    return lang.startsWith('en') ? 'en' : 'pt';
  };

  const labels = {
    pt: {
      victory: 'VITÓRIA',
      lose: 'DERROTA',
      result: 'Resultado final',
      continue: 'Continuar',
      winSummary: 'Missão concluída. Resultado registrado no fliperama.',
      loseSummary: 'Tentativa encerrada. Pontuação registrada no fliperama.',
    },
    en: {
      victory: 'WINS',
      lose: 'LOSE',
      result: 'Final result',
      continue: 'Continue',
      winSummary: 'Mission complete. Result registered in the arcade.',
      loseSummary: 'Run ended. Score registered in the arcade.',
    },
  };

  const formatValue = value => (
    typeof value === 'number' ? value.toLocaleString(getLanguage() === 'pt' ? 'pt-BR' : 'en-US') : String(value)
  );

  window.QCHArcadeResults = {
    show(options) {
      const {
        gameId,
        victory,
        score = 0,
        stats = [],
        summary,
      } = options;
      const language = getLanguage();
      const copy = labels[language];
      const asset = GAME_ASSETS[gameId];
      const result = victory ? 'victory' : 'lose';
      const image = asset
        ? `/assets/games/${asset.folder}/${asset.file}_${result}.webp`
        : '';

      const previous = document.querySelector('.qch-result-overlay');
      if (previous) previous.remove();

      const overlay = document.createElement('div');
      overlay.className = 'qch-result-overlay';
      overlay.innerHTML = `
        <section class="qch-result-card ${victory ? 'is-victory' : 'is-lose'}" role="dialog" aria-modal="true">
          <div class="qch-result-art">
            <img src="${image}" alt="">
          </div>
          <div class="qch-result-info">
            <div class="qch-result-kicker">${copy.result}</div>
            <h1 class="qch-result-title">${victory ? copy.victory : copy.lose}</h1>
            <p class="qch-result-summary">${summary || (victory ? copy.winSummary : copy.loseSummary)}</p>
            <div class="qch-result-stats">
              ${stats.map(item => `
                <div class="qch-result-stat">
                  <span>${item.label}</span>
                  <span>${formatValue(item.value)}</span>
                </div>
              `).join('')}
            </div>
            <button class="qch-result-button" type="button">${copy.continue}</button>
          </div>
        </section>
      `;

      const close = () => {
        window.parent.postMessage({
          type: victory ? 'GAME_COMPLETE' : 'GAME_OVER',
          final: true,
          victory,
          gameId,
          score,
        }, '*');
        window.parent.postMessage({
          type: 'CLOSE_MINI_GAME',
          gameId,
          score,
        }, '*');
      };

      overlay.querySelector('.qch-result-button').addEventListener('click', close);
      document.body.appendChild(overlay);
      window.parent.postMessage({
        type: 'ARCADE_RESULT_SHOWN',
        final: true,
        victory,
        gameId,
        score,
      }, '*');
    },
  };
})();
