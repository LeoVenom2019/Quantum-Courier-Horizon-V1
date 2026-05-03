'use client';

import { useCallback, useRef, useEffect } from 'react';

// Tipos conhecidos com arquivos reais
export type SFXType = 
  | 'click'           // Cliques genéricos em botões
  | 'hover'           // Passar o mouse (opcional)
  | 'success'         // Compra realizada, missão concluída
  | 'error'           // Saldo insuficiente, ação negada
  | 'laser'           // Tiro de nave
  | 'warp'            // Início de viagem
  | 'notification'    // Novos logs ou alertas
  | 'tech_success'    // Sucesso na pesquisa de tecnologia (Rota 1 e 2)
  | 'achievement'     // Conquista desbloqueada
  | 'enemy_explosion' // Explosão de inimigo em batalha
  | 'level_up'        // Melhoria de nave ou nível
  | 'shoot_player'    // Tiro do jogador
  | 'shoot_enemy'     // Tiro do inimigo
  | 'saving_robot_event' // Evento de conserto do robô (21s)
  | 'low_to_upgrade'    // Falha ao tentar melhorar sem recursos
  | 'seeker_alpha_mission_start'
  | 'collector_beta_mission_start'
  | 'ghost_gamma_mission_start'
  | 'kill_enemys_botton'
  | 'bobby_blue_theme_victory'
  | 'heal_ship'
  | 'start_research'
  | 'tutorial_open'
  | 'cash_register'
  | 'buying_iten'
  | 'police_sirene_1'
  | 'police_siren_2'
  | 'police_sirene_3'
  | 'start_engine_1'
  | 'start_engine_2'
  | 'open_window'
  | 'close_window'
  | 'ask_window'
  | 'bip_scanner'
  | 'eterion_fuell'
  | 'buy_new_robot'
  | 'bobby_mining'
  | 'mining_stones'
  | 'alert_alert';

// ─────────────────────────────────────────────────────────────────────────────
// ATENÇÃO: Só adicione aqui arquivos que JÁ EXISTEM em public/audio/sfx/
// ─────────────────────────────────────────────────────────────────────────────
const SFX_PATHS: Partial<Record<string, string>> = {
  tech_success: '/audio/sfx/tech.success.ogg',
  enemy_explosion: '/audio/sfx/enemy_explosion.ogg',
  level_up: '/audio/sfx/level_up.ogg',
  shoot_player: '/audio/sfx/shoot_player.ogg',
  shoot_enemy: '/audio/sfx/shoot_enemy.ogg',
  saving_robot_event: '/audio/sfx/saving_robot_event.ogg',
  low_to_upgrade: '/audio/sfx/low_to_upgrade.ogg',
  seeker_alpha_mission_start: '/audio/sfx/seeker_alpha_mission_start.ogg',
  collector_beta_mission_start: '/audio/sfx/collector_beta_mission_start.ogg',
  ghost_gamma_mission_start: '/audio/sfx/ghost_gamma_mission_start.ogg',
  kill_enemys_botton: '/audio/sfx/kill_enemys_botton.ogg',
  bobby_blue_theme_victory: '/audio/sfx/bobby_blue/bobby_blue_theme_victory.ogg',
  heal_ship: '/audio/sfx/heal_ship.ogg',
  start_research: '/audio/sfx/start.botton.ogg',
  tutorial_open: '/audio/sfx/tutorial_open.ogg',
  cash_register: '/audio/sfx/cash_register.ogg',
  buying_iten: '/audio/sfx/buying_iten.ogg',
  police_sirene_1: '/audio/sfx/police_sirene_1.ogg',
  police_siren_2: '/audio/sfx/police_siren_2.ogg',
  police_sirene_3: '/audio/sfx/police_sirene_3.ogg',
  start_engine_1: '/audio/sfx/start_engine_1.ogg',
  start_engine_2: '/audio/sfx/start_engine_2.ogg',
  open_window: '/audio/sfx/open_window.ogg',
  close_window: '/audio/sfx/close_window.ogg',
  ask_window: '/audio/sfx/ask_window.ogg',
  bip_scanner: '/audio/sfx/bip_scanner.ogg',
  eterion_fuell: '/audio/sfx/eterion_fuell.ogg',
  buy_new_robot: '/audio/sfx/buy_new_robot.ogg',
  bobby_mining: '/audio/sfx/bobby_mining.ogg',
  mining_stones: '/audio/sfx/mining_stones.ogg',
  alert_alert: '/audio/sfx/alert_alert.ogg',
};

// Singleton Cache para evitar recriação de objetos e preloading redundante
const globalAudioCache: Record<string, HTMLAudioElement> = {};

// Função auxiliar para pré-carregar (pode ser chamada fora do componente)
const preloadSfx = () => {
  if (typeof window === 'undefined') return;
  Object.entries(SFX_PATHS).forEach(([type, path]) => {
    if (path && !globalAudioCache[type]) {
      const audio = new Audio(path);
      audio.preload = 'auto';
      globalAudioCache[type] = audio;
    }
  });
};

// Executa o preloading assim que o módulo é carregado (no lado do cliente)
if (typeof window !== 'undefined') {
  preloadSfx();
}

interface SFXConfig {
  volume?: number;
}

export function useSFX(sfxOn: boolean = true) {
  const sfxOnRef = useRef(sfxOn);

  // Mantém sfxOnRef sempre atualizado sem causar re-renders
  useEffect(() => {
    sfxOnRef.current = sfxOn;
  }, [sfxOn]);

  /**
   * Toca um efeito sonoro pelo tipo.
   * Usa o cache global singleton para máxima performance.
   */
  const playSfx = useCallback((type: string, config: SFXConfig = {}) => {
    if (!sfxOnRef.current || typeof window === 'undefined') return;

    const path = SFX_PATHS[type];
    if (!path) return;

    try {
      let audio = globalAudioCache[type];
      
      // Lazy load se por algum motivo não foi pré-carregado
      if (!audio) {
        audio = new Audio(path);
        globalAudioCache[type] = audio;
      }

      // Se o som já estiver tocando, reinicia
      if (!audio.paused) {
        audio.currentTime = 0;
      } else {
        // Só define volume e tempo se necessário para reduzir chamadas ao motor de áudio
        audio.volume = config.volume ?? 0.4;
        audio.currentTime = 0;
      }

      const promise = audio.play();
      if (promise !== undefined) {
        promise.catch(err => {
          // Silenciosamente ignora erros de "autoplay policy" ou interrupção
          if (err.name !== 'AbortError') {
            console.warn(`SFX [${type}] playback failed:`, err);
          }
        });
      }
    } catch (err) {
      console.error('SFX error:', err);
    }
  }, []);

  /**
   * Interrompe um efeito sonoro específico se estiver tocando.
   */
  const stopSfx = useCallback((type: string) => {
    const audio = globalAudioCache[type];
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);

  return { playSfx, stopSfx };
}
