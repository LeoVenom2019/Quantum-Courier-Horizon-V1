import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const [gameData, dashboard, reducer, modal] = await Promise.all([
  readFile(new URL('./game-data.ts', import.meta.url), 'utf8'),
  readFile(new URL('../components/GameDashboard.tsx', import.meta.url), 'utf8'),
  readFile(new URL('./game-state/slices/missionsReducer.ts', import.meta.url), 'utf8'),
  readFile(new URL('../components/AchievementsModal.tsx', import.meta.url), 'utf8'),
]);

const achievementBlock = gameData.slice(
  gameData.indexOf('export const ACHIEVEMENTS'),
  gameData.indexOf('export const VOID_AIRCRAFT'),
);
const definitions = [...achievementBlock.matchAll(
  /\{ id: '([^']+)', name: '([^']+)', description: '([^']+)', type: '([^']+)', target: ([\d]+), icon: '([^']+)'/g,
)].map(match => ({
  id: match[1],
  name: match[2],
  description: match[3],
  type: match[4],
  target: Number(match[5]),
  icon: match[6],
}));

const expectedIds = [
  'first_delivery', 'qc_millionaire', 'battle_warrior', 'robot_owner', 'route_2_unlocked',
  'tech_master', 'void_unlocked', 'void_boss_zero_defeated', 'void_boss_1_defeated',
  'void_boss_2_defeated', 'void_boss_3_defeated', 'void_boss_4_defeated',
  'void_boss_5_defeated', 'void_boss_6_defeated', 'void_boss_7_defeated',
  'void_boss_8_defeated', 'void_boss_9_defeated', 'ship_collector', 'max_upgrade',
  'pirate_slayer', 'qc_trillionaire', 'earth_restorer', 'earth_restorer_100',
  'total_deliveries_10k', 'all_ships_r1_r2', 'total_missions_1k', 'battle_level_55',
  'mining_tycoon', 'perfect_pilot', 'ne_eden_builder_60', 'ne_genesis_builder_60',
  'ne_elysium_builder_60', 'ne_gaia_builder_60', 'ne_all_colony_sectors_100',
  'ne_land_search_perfect_defenses_10', 'ne_sea_search_perfect_defenses_10',
  'ne_direct_battles_10', 'ne_horizon_level_50', 'ne_horizon_level_100',
  'ne_horizon_battle_cards_6', 'ne_special_laser_10', 'ne_special_barrage_10',
  'ne_special_thor_10', 'ne_special_blizzard_10', 'ne_horizon_crit_90',
  'ne_horizon_stage_100', 'ne_horizon_stage_200', 'ne_missions_10', 'ne_missions_40',
  'ne_political_card_1', 'ne_political_cards_all', 'ne_battle_card_1',
  'ne_battle_cards_all', 'ne_wildcard_1', 'ne_wildcards_all',
  'ne_mythic_battle_card_maxed', 'ne_mythic_political_card_maxed',
  'ne_all_cards_collected', 'ne_all_cards_maxed', 'secret_alien_name', 'ne_rare_fish_1',
  'ne_rare_fish_all', 'ne_relic_1', 'ne_relics_all', 'ne_rare_ring_1',
  'ne_rare_rings_all', 'ne_museum_all', 'ne_aether_maxed', 'ne_helicopter_win_1',
  'ne_helicopter_wins_10', 'ne_helicopter_intel_all', 'ne_warden_maxed', 'ne_tank_win_1',
  'ne_tank_wins_10', 'ne_tank_intel_all', 'ne_neptune_maxed', 'ne_poseidon_maxed',
  'ne_enemy_submarines_10', 'ne_submarine_depth_10000',
];

test('achievement catalog keeps all 79 unique audited entries', () => {
  const ids = definitions.map(item => item.id);
  assert.equal(definitions.length, 79);
  assert.equal(new Set(ids).size, definitions.length);
  assert.deepEqual(ids, expectedIds);
  definitions.forEach(item => {
    assert.ok(item.name.length > 0, `${item.id} needs a name`);
    assert.ok(item.description.length > 0, `${item.id} needs a description`);
    assert.ok(['accumulative', 'action', 'milestone'].includes(item.type), `${item.id} has an invalid type`);
    assert.ok(Number.isFinite(item.target) && item.target > 0, `${item.id} has an invalid target`);
  });
});

test('every catalog entry has a synchronization source', () => {
  const directlySynchronized = new Set(
    [...dashboard.matchAll(/updateAchievementProgress\('([^']+)'/g)].map(match => match[1]),
  );
  const bossMappings = new Set(
    [...dashboard.matchAll(/\d+: '(void_boss_[^']+)'/g)].map(match => match[1]),
  );
  const synchronized = new Set([...directlySynchronized, ...bossMappings]);

  assert.deepEqual(
    expectedIds.filter(id => !synchronized.has(id)),
    [],
    'Every achievement must be connected to live progress synchronization',
  );
  assert.deepEqual(
    [...synchronized].filter(id => !expectedIds.includes(id)),
    [],
    'Runtime synchronization must not reference removed achievements',
  );
});

test('unlocking, progress persistence, and the complete catalog remain wired to the UI', () => {
  assert.match(dashboard, /normalizeAchievementProgressAmount\(achievementProgressRef\.current\[id\]\)/);
  assert.match(dashboard, /normalizeAchievementMetaForCatalog\(value, ACHIEVEMENT_IDS\)/);
  assert.match(dashboard, /dispatch\(\{ type: 'UPDATE_ACHIEVEMENT_PROGRESS'/);
  assert.match(dashboard, /dispatch\(\{ type: 'UNLOCK_ACHIEVEMENT'/);
  assert.match(reducer, /case 'UPDATE_ACHIEVEMENT_PROGRESS'/);
  assert.match(reducer, /case 'UNLOCK_ACHIEVEMENT'/);
  assert.match(modal, /ACHIEVEMENTS\.slice\(page \* 9, \(page \+ 1\) \* 9\)/);
  assert.match(modal, /Math\.ceil\(ACHIEVEMENTS\.length \/ 9\)/);
});

test('audited semantic fixes cannot regress', () => {
  assert.match(dashboard, /getPirateBattleVictoryProgress\(historyStats\)/);
  assert.match(dashboard, /getDeliveryMissionCompletionProgress\(\{ historyStats, missions \}\)/);
  assert.match(dashboard, /card && isBattleCard\(card\)/);
  assert.match(dashboard, /getReachedSubmarineDepthProgress\(newEarthAchievementMetrics\)/);
  assert.doesNotMatch(dashboard, /deepestAvailableSubmarine/);
});
