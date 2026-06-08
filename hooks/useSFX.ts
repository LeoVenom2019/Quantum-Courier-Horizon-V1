'use client';

import { useCallback, useRef, useEffect } from 'react';
import { useSoundMaster } from './useSoundMaster';

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
  | 'hangar_open_door'
  | 'hangar_close_door'
  | 'open_window_void'
  | 'close_window_void'
  | 'donation_1_void'
  | 'donation_2_void'
  | 'donation_3_void'
  | 'full_void'
  | 'ask_window'
  | 'bip_scanner'
  | 'eterion_fuell'
  | 'buy_new_robot'
  | 'bobby_mining'
  | 'mining_stones'
  | 'serve_glass'
  | 'alert_alert'
  | 'songs_of_war'
  | 'warning_gaming'
  | 'alien_explosion_zero' | 'alien_explosion_1' | 'alien_explosion_2' | 'alien_explosion_3' | 'alien_explosion_4' | 'alien_explosion_5' | 'alien_explosion_6' | 'alien_explosion_7' | 'alien_explosion_8' | 'alien_explosion_9'
  | 'boss_explosion_zero' | 'boss_explosion_1' | 'boss_explosion_2' | 'boss_explosion_3' | 'boss_explosion_4' | 'boss_explosion_5' | 'boss_explosion_6' | 'boss_explosion_7' | 'boss_explosion_8' | 'boss_explosion_9'
  | 'boss_scream_zero' | 'boss_scream_1' | 'boss_scream_2' | 'boss_scream_3' | 'boss_scream_4' | 'boss_scream_5' | 'boss_scream_6' | 'boss_scream_7' | 'boss_scream_8' | 'boss_scream_9'
  | 'shoot_monster_zero' | 'shoot_monster_1' | 'shoot_monster_2' | 'shoot_monster_3' | 'shoot_monster_4' | 'shoot_monster_5' | 'shoot_monster_6' | 'shoot_monster_7' | 'shoot_monster_8' | 'shoot_monster_9'
  | 'shoot_elite_zero' | 'shoot_elite_1' | 'shoot_elite_2' | 'shoot_elite_3' | 'shoot_elite_4' | 'shoot_elite_5' | 'shoot_elite_6' | 'shoot_elite_7' | 'shoot_elite_8' | 'shoot_elite_9'
  | 'shoot_boss_zero' | 'shoot_boss_1' | 'shoot_boss_2' | 'shoot_boss_3' | 'shoot_boss_4' | 'shoot_boss_5' | 'shoot_boss_6' | 'shoot_boss_7' | 'shoot_boss_8' | 'shoot_boss_9'
  | 'laser_up' | 'laser_cannon' | 'shield_up' | 'target_up' | 'epic_battle_ship' | 'target_up_2' | 'login_start' | 'aba_click' | 'change_air_ships' | 'tec_extract_change'
  | 'big_energy_explosion_' | 'big_energy_explosion_2'
  | 'censor_beep'
  | 'heal_ship_2'
  | 'cash_register_2'
  | 'claim_card'
  | 'equip_card'
  | 'unequip_card'
  | 'view_card'
  | 'radar_skip_victory'
  | 'radar_skip_defeat'
  | 'buy'
  | 'insert_coins'
  | 'game_over';

// ─────────────────────────────────────────────────────────────────────────────
// ATENÇÃO: Só adicione aqui arquivos que JÁ EXISTEM em public/audio/sfx/
// ─────────────────────────────────────────────────────────────────────────────
const SFX_PATHS: Partial<Record<string, string>> = {
  tech_success: '/audio/sfx/tech.success.ogg',
  success: '/audio/sfx/cash_register.ogg',
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
  new_earth_access_denied_1: '/audio/sfx/bobby_blue/access_denied/access_denied_1.ogg',
  new_earth_access_denied_2: '/audio/sfx/bobby_blue/access_denied/access_denied_2.ogg',
  new_earth_access_denied_3: '/audio/sfx/bobby_blue/access_denied/access_denied_3.ogg',
  new_earth_access_denied_4: '/audio/sfx/bobby_blue/access_denied/access_denied_4.ogg',
  new_earth_access_denied_5: '/audio/sfx/bobby_blue/access_denied/access_denied_5.ogg',
  new_earth_access_denied_6: '/audio/sfx/bobby_blue/access_denied/access_denied_6.ogg',
  new_earth_access_denied_7: '/audio/sfx/bobby_blue/access_denied/access_denied_7.ogg',
  new_earth_access_denied_8: '/audio/sfx/bobby_blue/access_denied/access_denied_8.ogg',
  new_earth_access_denied_9: '/audio/sfx/bobby_blue/access_denied/access_denied_9.ogg',
  new_earth_access_denied_10: '/audio/sfx/bobby_blue/access_denied/access_denied_10.ogg',
  new_earth_mission_complete_1: '/audio/sfx/bobby_blue/mission_complete/mission_complete_1.ogg',
  new_earth_mission_complete_2: '/audio/sfx/bobby_blue/mission_complete/mission_complete_2.ogg',
  new_earth_mission_complete_3: '/audio/sfx/bobby_blue/mission_complete/mission_complete_3.ogg',
  new_earth_mission_complete_4: '/audio/sfx/bobby_blue/mission_complete/mission_complete_4.ogg',
  new_earth_mission_complete_5: '/audio/sfx/bobby_blue/mission_complete/mission_complete_5.ogg',
  new_earth_mission_complete_6: '/audio/sfx/bobby_blue/mission_complete/mission_complete_6.ogg',
  new_earth_mission_complete_7: '/audio/sfx/bobby_blue/mission_complete/mission_complete_7.ogg',
  new_earth_mission_complete_8: '/audio/sfx/bobby_blue/mission_complete/mission_complete_8.ogg',
  new_earth_mission_complete_9: '/audio/sfx/bobby_blue/mission_complete/mission_complete_9.ogg',
  new_earth_mission_complete_10: '/audio/sfx/bobby_blue/mission_complete/mission_complete_10.ogg',
  new_earth_population_milestone_1000000: '/audio/sfx/bobby_blue/population milestone/one_milion.ogg',
  new_earth_population_milestone_10000000: '/audio/sfx/bobby_blue/population milestone/ten_milion.ogg',
  new_earth_population_milestone_50000000: '/audio/sfx/bobby_blue/population milestone/fifty_milion.ogg',
  new_earth_population_milestone_100000000: '/audio/sfx/bobby_blue/population milestone/one_hundred_milion.ogg',
  new_earth_population_milestone_500000000: '/audio/sfx/bobby_blue/population milestone/five_hundred_milion.ogg',
  new_earth_population_milestone_1000000000: '/audio/sfx/bobby_blue/population milestone/billion.ogg',
  new_earth_population_milestone_5000000000: '/audio/sfx/bobby_blue/population milestone/five_billion.ogg',
  new_earth_population_milestone_10000000000: '/audio/sfx/bobby_blue/population milestone/ten_billion.ogg',
  new_earth_population_milestone_20000000000: '/audio/sfx/bobby_blue/population milestone/twenty_billion.ogg',
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
  hangar_open_door: '/assets/rota4/SFX_new_land/hangar_open_door.ogg',
  hangar_close_door: '/assets/rota4/SFX_new_land/hangar_close_door.ogg',
  open_window_void: '/audio/sfx/open_window_void.ogg',
  close_window_void: '/audio/sfx/close_window_void.ogg',
  donation_1_void: '/audio/sfx/donation_1_void.ogg',
  donation_2_void: '/audio/sfx/donation_2_void.ogg',
  donation_3_void: '/audio/sfx/donation_3_void.ogg',
  full_void: '/audio/sfx/full_void.ogg',
  ask_window: '/audio/sfx/ask_window.ogg',
  bip_scanner: '/audio/sfx/bip_scanner.ogg',
  eterion_fuell: '/audio/sfx/eterion_fuell.ogg',
  buy_new_robot: '/audio/sfx/buy_new_robot.ogg',
  bobby_mining: '/audio/sfx/bobby_mining.ogg',
  mining_stones: '/audio/sfx/mining_stones.ogg',
  serve_glass: '/audio/sfx/serve_glass.ogg',
  alert_alert: '/audio/sfx/alert_alert.ogg',
  songs_of_war: '/audio/sfx/songs_of_war.ogg',
  warning_gaming: '/assets/rota4/SFX_new_land/warning_gaming.ogg',
  insert_coins: '/assets/games/flipers_sfx/insert_coins.ogg',
  // Void Monster SFX
  alien_explosion_zero: '/audio/sfx/void/alien_explosion_zero.ogg',
  boss_explosion_zero: '/audio/sfx/void/boss_explosion_zero.ogg',
  boss_explosion_1: '/audio/sfx/void/boss_explosion_1.ogg',
  boss_explosion_2: '/audio/sfx/void/boss_explosion_2.ogg',
  boss_explosion_3: '/audio/sfx/void/boss_explosion_3.ogg',
  boss_explosion_4: '/audio/sfx/void/boss_explosion_4.ogg',
  boss_explosion_5: '/audio/sfx/void/boss_explosion_5.ogg',
  boss_explosion_6: '/audio/sfx/void/boss_explosion_6.ogg',
  boss_explosion_7: '/audio/sfx/void/boss_explosion_7.ogg',
  boss_explosion_8: '/audio/sfx/void/boss_explosion_8.ogg',
  boss_explosion_9: '/audio/sfx/void/boss_explosion_9.ogg',
  boss_scream_zero: '/audio/sfx/void/boss_scream_zero.ogg',
  boss_scream_1: '/audio/sfx/void/boss_scream_1.ogg',
  boss_scream_2: '/audio/sfx/void/boss_scream_2.ogg',
  boss_scream_3: '/audio/sfx/void/boss_scream_3.ogg',
  boss_scream_4: '/audio/sfx/void/boss_scream_4.ogg',
  boss_scream_5: '/audio/sfx/void/boss_scream_5.ogg',
  boss_scream_6: '/audio/sfx/void/boss_scream_6.ogg',
  boss_scream_7: '/audio/sfx/void/boss_scream_7.ogg',
  boss_scream_8: '/audio/sfx/void/boss_scream_8.ogg',
  boss_scream_9: '/audio/sfx/void/boss_scream_9.ogg',
  // Void Attack SFX
  shoot_monster_zero: '/audio/sfx/void/shoot_monster_zero.ogg',
  shoot_elite_zero: '/audio/sfx/void/shoot_elite_zero.ogg',
  shoot_boss_zero: '/audio/sfx/void/shoot_boss_zero.ogg',
  shoot_boss_1: '/audio/sfx/void/shoot_boss_1.ogg',
  shoot_boss_2: '/audio/sfx/void/shoot_boss_2.ogg',
  shoot_boss_3: '/audio/sfx/void/shoot_boss_3.ogg',
  shoot_boss_4: '/audio/sfx/void/shoot_boss_4.ogg',
  shoot_boss_5: '/audio/sfx/void/shoot_boss_5.ogg',
  shoot_boss_6: '/audio/sfx/void/shoot_boss_6.ogg',
  shoot_boss_7: '/audio/sfx/void/shoot_boss_7.ogg',
  shoot_boss_8: '/audio/sfx/void/shoot_boss_8.ogg',
  shoot_boss_9: '/audio/sfx/void/shoot_boss_9.ogg',
  laser_up: '/audio/sfx/laser_up.ogg',
  laser_cannon: '/audio/sfx/laser_cannon.ogg',
  shield_up: '/audio/sfx/shield_up.ogg',
  target_up: '/audio/sfx/target_up.ogg',
  epic_battle_ship: '/audio/sfx/epic_battle_ship.ogg',
  target_up_2: '/audio/sfx/target_up_2.ogg',
  big_energy_explosion_: '/audio/sfx/big_energy_explosion_.ogg',
  big_energy_explosion_2: '/audio/sfx/big_energy_explosion_2.ogg',
  login_start: '/audio/sfx/login_start.ogg',
  aba_click: '/audio/sfx/aba_click.ogg',
  change_air_ships: '/audio/sfx/change_air_ships.ogg',
  tec_extract_change: '/audio/sfx/tec_extract_change.ogg',
  censor_beep: '/audio/sfx/censor_beep.ogg',
  buy: '/audio/sfx/buying_iten.ogg',
  claim_card: '/audio/sfx/claim_card.ogg',
  equip_card: '/audio/sfx/equip_card.ogg',
  unequip_card: '/audio/sfx/unequip_card.ogg',
  view_card: '/audio/sfx/view_card.ogg',
  radar_skip_victory: '/audio/sfx/radar_skip_victory.ogg',
  radar_skip_defeat: '/audio/sfx/radar_skip_defeat.ogg',
  heal_ship_2: '/audio/sfx/heal_ship_2.ogg',
  cash_register_2: '/audio/sfx/cash_register_2.ogg',
  game_over: '/audio/sfx/game_over.ogg'
};

// Singleton Cache para evitar recriação de objetos e preloading redundante
const globalAudioCache: Record<string, HTMLAudioElement> = {};
const globalExclusiveAudioLocks: Record<string, HTMLAudioElement | undefined> = {};

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

export type SFXCategory = 'ui' | 'player' | 'enemy' | 'ambient';

interface SFXConfig {
  volume?: number;
  loop?: boolean;
  category?: SFXCategory;
  exclusiveKey?: string;
}

// Mapeamento automático de categorias por prefixo ou nome
const getCategoryForType = (type: string): SFXCategory => {
  if (type.startsWith('shoot_player') || type.includes('laser') || type.includes('shield_up') || type.includes('heal')) return 'player';
  if (type.startsWith('shoot_') || type.includes('explosion') || type.includes('scream') || type.includes('enemy')) return 'enemy';
  if (type.includes('alert') || type.includes('mining') || type.includes('event')) return 'ambient';
  return 'ui'; // Default para botões e janelas
};

export function useSFX(_deprecatedSfxOn: boolean = true) {
  const master = useSoundMaster();
  const settingsRef = useRef(master);

  // Mantém refs sempre atualizados
  useEffect(() => {
    settingsRef.current = master;

    if (!master.masterSfxOn) {
      Object.values(globalAudioCache).forEach(audio => {
        if (audio.loop && !audio.paused) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
    }
  }, [master]);

  /**
   * Toca um efeito sonoro pelo tipo com suporte a canais.
   */
  const playSfx = useCallback((type: string, config: SFXConfig = {}) => {
    const s = settingsRef.current;
    if (!s.masterSfxOn || typeof window === 'undefined') return;

    let path = SFX_PATHS[type];
    
    // Fallback logic para sons do Vazio (Rota 3)
    if (!path && type.includes('_') && !type.endsWith('_zero')) {
      const baseType = type.split('_').slice(0, -1).join('_');
      const fallbackType = `${baseType}_zero`;
      path = SFX_PATHS[fallbackType];
    }

    if (!path) return;

    try {
      if (config.exclusiveKey) {
        const activeAudio = globalExclusiveAudioLocks[config.exclusiveKey];
        if (activeAudio && !activeAudio.paused && !activeAudio.ended) return;
      }

      let audio = globalAudioCache[type];
      
      if (!audio) {
        audio = new Audio(path);
        globalAudioCache[type] = audio;
      }

      // 1. Determina a categoria
      const category = config.category || getCategoryForType(type);
      
      // 2. Busca o volume da categoria (fallback 1.0 se não existir)
      let categoryVolume = 1.0;
      switch (category) {
        case 'ui': categoryVolume = s.uiVolume ?? 1.0; break;
        case 'player': categoryVolume = s.playerVolume ?? 1.0; break;
        case 'enemy': categoryVolume = s.enemyVolume ?? 1.0; break;
        case 'ambient': categoryVolume = s.ambientVolume ?? 1.0; break;
      }

      // 3. Calcula volume final (Base * Categoria * Master)
      audio.loop = config.loop ?? false;
      const baseVolume = config.volume ?? 0.8;
      const masterVolume = s.masterSfxVolume ?? 1.0;
      
      const finalVolume = baseVolume * categoryVolume * masterVolume;
      audio.volume = isFinite(finalVolume) ? Math.min(1, Math.max(0, finalVolume)) : 0.5;

      if (config.exclusiveKey) {
        const exclusiveKey = config.exclusiveKey;
        globalExclusiveAudioLocks[exclusiveKey] = audio;
        audio.onended = () => {
          if (globalExclusiveAudioLocks[exclusiveKey] === audio) {
            delete globalExclusiveAudioLocks[exclusiveKey];
          }
        };
      }

      // Se o som já estiver tocando e não for loop, reinicia
      if (!audio.paused && !audio.loop) {
        audio.currentTime = 0;
      } else if (audio.paused) {
        audio.currentTime = 0;
      }

      const promise = audio.play();
      if (promise !== undefined) {
        promise.catch(err => {
          if (config.exclusiveKey && globalExclusiveAudioLocks[config.exclusiveKey] === audio) {
            delete globalExclusiveAudioLocks[config.exclusiveKey];
          }
          // Ignore AbortError and NotAllowedError (autoplay) as they are expected in some contexts
          if (err.name === 'AbortError' || err.name === 'NotAllowedError') {
            return; 
          }
          console.warn(`[SFX] Playback failed for "${type}":`, err.message || err);
        });
      }
    } catch (err) {
      console.error('SFX error:', err);
    }
  }, []);

  /**
   * Interrompe um efeito sonoro específico.
   */
  const stopSfx = useCallback((type: string) => {
    const audio = globalAudioCache[type];
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      Object.entries(globalExclusiveAudioLocks).forEach(([key, lockedAudio]) => {
        if (lockedAudio === audio) delete globalExclusiveAudioLocks[key];
      });
    }
  }, []);

  return { playSfx, stopSfx };
}
