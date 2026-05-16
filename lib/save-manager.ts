export const CURRENT_SAVE_VERSION = "1.1.0";

export interface ModularSaveData {
  version: string;
  global: {
    qc: number;
    playerName: string;
    routeTier: string;
    route4Unlocked: boolean;
    gameTimeSeconds: number;
    totalDeliveries: number;
    deliveriesByLocation: Record<string, number>;
    historyStats: Record<string, any>;
    activeCodes: Record<string, boolean>;
    seenTutorials: Record<string, boolean>;
    completedInitialMissions: string[];
    missions: any[];
    autoClaimMissions: boolean;
    missionMythicBonus: number;
    missionAlienBonus: number;
    missionLegendaryBonus: number;
    missionRewardLevel: Record<string, number>;
    radarUnlocked: Record<string, boolean>;
    lastScanTime: number;
    unlockedAchievements: string[];
    achievementProgress: Record<string, number>;
    aetherion: number;
    miningWaste: number;
    solarEnergy: number;
    aetherionTubes: number;
    hasSeenRoute2UnlockMessage: boolean;
  };
  routes: {
    unlockedRouteIds: string[];
    autoTravelSlots: Record<string, number>;
    autoTravelActive: Record<string, boolean>;
    autoTravelDesired: Record<string, number>;
    doubleRouteLevel: number;
  };
  ships: {
    ownedShips: Record<string, number>;
    shipXP: number;
    shipLevel: number;
  };
  tech: {
    techLevels: Record<string, any>;
    unlockedTechLevels: Record<string, number>;
  };
  mining: {
    miningRobots: Record<string, number>;
    miningRobotLevels: Record<string, number>;
    oresCollected: Record<string, number>;
    autoSellByOre: Record<string, boolean>;
    autoSellUnlockedByOre: Record<string, boolean>;
    miningCompressionLevels: Record<string, number>;
  };
  skills: {
    skillLendariaLevel: Record<string, number>;
    skillMiticaLevel: Record<string, number>;
    skillAlienLevel: Record<string, number>;
    skillTempoDinheiroLevel: Record<string, number>;
    skillRobosOlimpicosLevel: Record<string, number>;
  };
  extraction_interstellar: {
    extractionTechLevel: number;
    solarMappingLevel: number;
    captureLevel: number;
    battleLevel: number;
    radarLevel: number;
    privatePoliceLevel: number;
    doomPLevel: number;
    autoSkipRandomBattles: boolean;
    isRetributionActive: boolean;
    isFatigueActive: boolean;
    unlockedExtractionPoints: string[];
    extractionPacks: Record<string, any>;
    extractionRobotLevels: Record<string, number>;
    extractionProductionLevels: Record<string, number>;
    extractionCompressionLevels: Record<string, number>;
    extractionAutoSell: Record<string, boolean>;
    extractionAutoSellUnlocked: Record<string, boolean>;
    totalExtractionProfit: number;
  };
  void_aircraft: {
    isVoidWarActive: boolean;
    voidWarProgress: number;
    voidResources: Record<string, number>;
    voidCompactedResources: Record<string, number>;
    voidDonationModes: Record<string, string>;
    voidAircraftMissions: Record<string, any>;
    voidAircraftUpgrades: Record<string, any>;
    voidAircraftAutoToggles: Record<string, boolean>;
    voidBattleShipStats: any;
    voidPOIsInspiration: Record<string, any>;
    voidPOIQCDonations: Record<string, number>;
    hasWonEliminateEnemiesRoute3: boolean;
    robotRepairProgress: number;
    isRobotRepaired: boolean;
    battleShipUpgradeLevel: number;
    warCoreLevel: number;
    fleetPower: number;
    voidAutoShipmentUnlocked: boolean;
    voidAutoShipmentActive: boolean;
    unlockedVoidAircraft: string[];
    voidAircraftConstruction: Record<string, { endTime: number }>;
  };
  earth_reconstruction: {
    earthReconstructionProgress: Record<string, number>;
    earthPopulation: number;
    earthMaleRatio: number;
    earthBiodiversity: number;
    earthHealth: number;
    earthHappiness: number;
    earthSecurity: number;
    earthQualityOfLife: number;
    earthCouples: number;
    earthBirthRegistry: Record<string, number>;
    earthProjectBoostCount: number;
    earthSeason: number;
    earthEvents: any[];
    colonies: any[];
    // Visual restoration
    atmosphere: number;
    temperature: number;
    hydrosphere: number;
    biosphere: number;
  };
  arcadeScores: Record<string, number>;
  localRecords: any[];
  unlockedCodes: string[];
}

export const SaveManager = {
  createSave: (flatData: any): ModularSaveData => {
    return {
      version: CURRENT_SAVE_VERSION,
      global: {
        qc: flatData.qc || 0,
        playerName: flatData.playerName || '',
        routeTier: flatData.routeTier || 'Solar',
        route4Unlocked: flatData.route4Unlocked || false,
        gameTimeSeconds: flatData.gameTimeSeconds || 0,
        totalDeliveries: flatData.totalDeliveries || 0,
        deliveriesByLocation: flatData.deliveriesByLocation || {},
        historyStats: flatData.historyStats || {},
        activeCodes: flatData.activeCodes || {},
        seenTutorials: flatData.seenTutorials || {},
        completedInitialMissions: flatData.completedInitialMissions || [],
        missions: flatData.missions || [],
        autoClaimMissions: flatData.autoClaimMissions || false,
        missionMythicBonus: flatData.missionMythicBonus || 0,
        missionAlienBonus: flatData.missionAlienBonus || 0,
        missionLegendaryBonus: flatData.missionLegendaryBonus || 0,
        missionRewardLevel: flatData.missionRewardLevel || {},
        radarUnlocked: flatData.radarUnlocked || {},
        lastScanTime: flatData.lastScanTime || 0,
        unlockedAchievements: flatData.unlockedAchievements || [],
        achievementProgress: flatData.achievementProgress || {},
        aetherion: flatData.aetherion || 0,
        miningWaste: flatData.miningWaste || 0,
        solarEnergy: flatData.solarEnergy || 0,
        aetherionTubes: flatData.aetherionTubes || 0,
        hasSeenRoute2UnlockMessage: flatData.hasSeenRoute2UnlockMessage || false
      },
      routes: {
        unlockedRouteIds: flatData.unlockedRouteIds || [],
        autoTravelSlots: flatData.autoTravelSlots || {},
        autoTravelActive: flatData.autoTravelActive || {},
        autoTravelDesired: flatData.autoTravelDesired || {},
        doubleRouteLevel: flatData.doubleRouteLevel || 0
      },
      ships: {
        ownedShips: flatData.ownedShips || {},
        shipXP: flatData.shipXP || 0,
        shipLevel: flatData.shipLevel || 1
      },
      tech: {
        techLevels: flatData.techLevels || {},
        unlockedTechLevels: flatData.unlockedTechLevels || {}
      },
      mining: {
        miningRobots: flatData.miningRobots || {},
        miningRobotLevels: flatData.miningRobotLevels || {},
        oresCollected: flatData.oresCollected || {},
        autoSellByOre: flatData.autoSellByOre || {},
        autoSellUnlockedByOre: flatData.autoSellUnlockedByOre || {},
        miningCompressionLevels: flatData.miningCompressionLevels || {}
      },
      skills: {
        skillLendariaLevel: flatData.skillLendariaLevel || {},
        skillMiticaLevel: flatData.skillMiticaLevel || {},
        skillAlienLevel: flatData.skillAlienLevel || {},
        skillTempoDinheiroLevel: flatData.skillTempoDinheiroLevel || {},
        skillRobosOlimpicosLevel: flatData.skillRobosOlimpicosLevel || {}
      },
      extraction_interstellar: {
        extractionTechLevel: flatData.extractionTechLevel || 0,
        solarMappingLevel: flatData.solarMappingLevel || 0,
        captureLevel: flatData.captureLevel || 0,
        battleLevel: flatData.battleLevel || 0,
        radarLevel: flatData.radarLevel || 0,
        privatePoliceLevel: flatData.privatePoliceLevel || 0,
        doomPLevel: flatData.doomPLevel || 0,
        autoSkipRandomBattles: flatData.autoSkipRandomBattles || false,
        isRetributionActive: flatData.isRetributionActive || false,
        isFatigueActive: flatData.isFatigueActive || false,
        unlockedExtractionPoints: flatData.unlockedExtractionPoints || [],
        extractionPacks: flatData.extractionPacks || {},
        extractionRobotLevels: flatData.extractionRobotLevels || {},
        extractionProductionLevels: flatData.extractionProductionLevels || {},
        extractionCompressionLevels: flatData.extractionCompressionLevels || {},
        extractionAutoSell: flatData.extractionAutoSell || {},
        extractionAutoSellUnlocked: flatData.extractionAutoSellUnlocked || {},
        totalExtractionProfit: flatData.totalExtractionProfit || 0
      },
      void_aircraft: {
        isVoidWarActive: flatData.isVoidWarActive || false,
        voidWarProgress: flatData.voidWarProgress || 0,
        voidResources: flatData.voidResources || {},
        voidCompactedResources: flatData.voidCompactedResources || {},
        voidDonationModes: flatData.voidDonationModes || {},
        voidAircraftMissions: flatData.voidAircraftMissions || {},
        voidAircraftUpgrades: flatData.voidAircraftUpgrades || {},
        voidAircraftAutoToggles: flatData.voidAircraftAutoToggles || {},
        voidBattleShipStats: flatData.voidBattleShipStats || {},
        voidPOIsInspiration: flatData.voidPOIsInspiration || {},
        voidPOIQCDonations: flatData.voidPOIQCDonations || {},
        hasWonEliminateEnemiesRoute3: flatData.hasWonEliminateEnemiesRoute3 || false,
        robotRepairProgress: flatData.robotRepairProgress || 0,
        isRobotRepaired: flatData.isRobotRepaired || false,
        battleShipUpgradeLevel: flatData.battleShipUpgradeLevel || 0,
        warCoreLevel: flatData.warCoreLevel || 1,
        fleetPower: flatData.fleetPower || 0,
        voidAutoShipmentUnlocked: flatData.voidAutoShipmentUnlocked || false,
        voidAutoShipmentActive: flatData.voidAutoShipmentActive || false,
        unlockedVoidAircraft: flatData.unlockedVoidAircraft || ['va-1'],
        voidAircraftConstruction: flatData.voidAircraftConstruction || {}
      },
      earth_reconstruction: {
        earthReconstructionProgress: flatData.earthReconstructionProgress || {},
        earthPopulation: flatData.earthPopulation || 0,
        earthMaleRatio: flatData.earthMaleRatio || 0.5,
        earthBiodiversity: flatData.earthBiodiversity || 0,
        earthHealth: flatData.earthHealth || 0,
        earthHappiness: flatData.earthHappiness || 0,
        earthSecurity: flatData.earthSecurity || 0,
        earthQualityOfLife: flatData.earthQualityOfLife || 0,
        earthCouples: flatData.earthCouples || 0,
        earthBirthRegistry: flatData.earthBirthRegistry || {},
        earthProjectBoostCount: flatData.earthProjectBoostCount || 0,
        earthSeason: flatData.earthSeason || 0,
        earthEvents: flatData.earthEvents || [],
        colonies: flatData.colonies || [],
        atmosphere: flatData.atmosphere || 0,
        temperature: flatData.temperature || 0,
        hydrosphere: flatData.hydrosphere || 0,
        biosphere: flatData.biosphere || 0
      },
      arcadeScores: flatData.arcadeScores || {},
      localRecords: flatData.localRecords || [],
      unlockedCodes: flatData.unlockedCodes || []
    };
  },

  loadSave: (rawData: any): any => {
    if (!rawData) return null;

    // 1. If it's a legacy flat save, we need to wrap it into the structured format
    if (!rawData.version) {
      return {
        economy: {
          qc: rawData.qc || 0,
          aetherion: rawData.aetherion || 0,
          miningWaste: rawData.miningWaste || 0,
          solarEnergy: rawData.solarEnergy || 0,
          aetherionTubes: rawData.aetherionTubes || 0,
          totalExtractionProfit: rawData.totalExtractionProfit || 0
        },
        progression: {
          routeTier: rawData.routeTier || 'Solar',
          unlockedRouteIds: rawData.unlockedRouteIds || ['solar-1', 'solar-2'],
          ownedShips: rawData.ownedShips || { 'solar-1': 1 },
          techLevels: rawData.techLevels || {},
          unlockedTechLevels: rawData.unlockedTechLevels || {},
          autoTravelSlots: rawData.autoTravelSlots || {},
          shipLevel: rawData.shipLevel || 1,
          shipXP: rawData.shipXP || 0,
          battleLevel: rawData.battleLevel || 1,
          radarLevel: rawData.radarLevel || 1,
          privatePoliceLevel: rawData.privatePoliceLevel || 0,
          doubleRouteLevel: rawData.doubleRouteLevel || 0,
          doomPLevel: rawData.doomPLevel || 0,
          captureLevel: rawData.captureLevel || 0,
          extractionTechLevel: rawData.extractionTechLevel || 0,
          solarMappingLevel: rawData.solarMappingLevel || 0,
          warCoreLevel: rawData.warCoreLevel || 0,
          battleShipUpgradeLevel: rawData.battleShipUpgradeLevel || 0,
          route4Unlocked: rawData.route4Unlocked || false,
          gameTimeSeconds: rawData.gameTimeSeconds || 0,
          researchingTech: null
        },
        mining: {
          miningRobots: rawData.miningRobots || {},
          miningRobotLevels: rawData.miningRobotLevels || {},
          oresCollected: rawData.oresCollected || {},
          autoSellByOre: rawData.autoSellByOre || {},
          autoSellUnlockedByOre: rawData.autoSellUnlockedByOre || {},
          miningCompressionLevels: rawData.miningCompressionLevels || {},
          extractionPacks: rawData.extractionPacks || {},
          extractionRobotLevels: rawData.extractionRobotLevels || {},
          extractionProductionLevels: rawData.extractionProductionLevels || {},
          extractionAutoSell: rawData.extractionAutoSell || {},
          extractionAutoSellUnlocked: rawData.extractionAutoSellUnlocked || {},
          extractionCompressionLevels: rawData.extractionCompressionLevels || {},
          unlockedExtractionPoints: rawData.unlockedExtractionPoints || [],
          researchingExtractionPoint: null,
          voidAutoShipmentUnlocked: rawData.voidAutoShipmentUnlocked || false,
          voidAutoShipmentActive: rawData.voidAutoShipmentActive || false
        },
        combat: {
          activeBattle: null,
          foundBattle: null,
          voidBattleStatus: 'idle',
          voidBattleShipStats: rawData.voidBattleShipStats || { hp: 100, maxHp: 100, shield: 0, maxShield: 50, damage: 10, critChance: 0.05, lootEfficiency: 1, rarity: 'common', upgrades: { damage: 0, shield: 0, crit: 0, loot: 0 } },
          isRetributionActive: rawData.isRetributionActive || false,
          isFatigueActive: rawData.isFatigueActive || false,
          voidResources: rawData.voidResources || { minerals: 0, energy: 0, food: 0, tech: 0, meds: 0 },
          voidCompactedResources: rawData.voidCompactedResources || {},
          voidPOIsInspiration: rawData.voidPOIsInspiration || {},
          isVoidWarActive: rawData.isVoidWarActive || false,
          voidWarProgress: rawData.voidWarProgress || { currentSector: 1, currentBattle: 1 },
          robotRepairProgress: rawData.robotRepairProgress || 0,
          isRobotRepaired: rawData.isRobotRepaired || false
        },
        missions: {
          missions: rawData.missions || [],
          historyStats: rawData.historyStats || {},
          unlockedAchievements: rawData.unlockedAchievements || [],
          achievementProgress: rawData.achievementProgress || {},
          skillLendariaLevel: rawData.skillLendariaLevel || { Solar: 0, Interstellar: 0 },
          skillMiticaLevel: rawData.skillMiticaLevel || { Solar: 0, Interstellar: 0 },
          skillAlienLevel: rawData.skillAlienLevel || { Solar: 0, Interstellar: 0 },
          skillTempoDinheiroLevel: rawData.skillTempoDinheiroLevel || { Solar: 0, Interstellar: 0 },
          skillRobosOlimpicosLevel: rawData.skillRobosOlimpicosLevel || { Solar: 0, Interstellar: 0 },
          missionRewardLevel: rawData.missionRewardLevel || { Solar: 0, Interstellar: 0 },
          missionMythicBonus: rawData.missionMythicBonus || 0,
          missionAlienBonus: rawData.missionAlienBonus || 0,
          missionLegendaryBonus: rawData.missionLegendaryBonus || 0,
          autoClaimMissions: rawData.autoClaimMissions || false,
          radarUnlocked: rawData.radarUnlocked || {},
          completedInitialMissions: rawData.completedInitialMissions || [],
          lastScanTime: rawData.lastScanTime || 0
        },
        earth: {
          population: rawData.earthPopulation || 0,
          maleRatio: rawData.earthMaleRatio || 0.5,
          biodiversity: rawData.earthBiodiversity || 0,
          health: rawData.earthHealth || 0,
          happiness: rawData.earthHappiness || 0,
          security: rawData.earthSecurity || 0,
          qualityOfLife: rawData.earthQualityOfLife || 0,
          season: rawData.earthSeason || 0,
          events: rawData.earthEvents || [],
          reconstructionProgress: rawData.earthReconstructionProgress || {},
          couples: rawData.earthCouples || 0,
          birthRegistry: rawData.earthBirthRegistry || {},
          projectBoostCount: rawData.earthProjectBoostCount || 0,
          atmosphere: rawData.atmosphere || 0,
          temperature: rawData.temperature || 0,
          hydrosphere: rawData.hydrosphere || 0,
          biosphere: rawData.biosphere || 0
        },
        system: {
          seenTutorials: rawData.seenTutorials || {},
          arcadeScores: rawData.arcadeScores || {},
          localRecords: rawData.localRecords || [],
          hasSeenRoute2UnlockMessage: rawData.hasSeenRoute2UnlockMessage || false,
          playerName: rawData.playerName || '',
        }
      };
    }

    // 2. It's a modular save (>= 1.1.0)
    // Map modular structure to Redux structured state
    const g = rawData.global || {};
    const r = rawData.routes || {};
    const s = rawData.ships || {};
    const tech = rawData.tech || {};
    const min = rawData.mining || {};
    const ex = rawData.extraction_interstellar || {};
    const v = rawData.void_aircraft || {};
    const sk = rawData.skills || {};
    const er = rawData.earth_reconstruction || {};

    return {
      economy: {
        qc: g.qc || 0,
        aetherion: g.aetherion || 0,
        miningWaste: g.miningWaste || 0,
        solarEnergy: g.solarEnergy || 0,
        aetherionTubes: g.aetherionTubes || 0,
        totalExtractionProfit: ex.totalExtractionProfit || 0
      },
      progression: {
        routeTier: g.routeTier || 'Solar',
        unlockedRouteIds: r.unlockedRouteIds || ['solar-1'],
        ownedShips: (() => {
          const ships = s.ownedShips || {};
          const normalized: any = {};
          Object.keys(ships).forEach(k => {
            const normalizedKey = k.charAt(0).toUpperCase() + k.slice(1);
            normalized[normalizedKey] = ships[k];
          });
          return normalized;
        })(),
        techLevels: tech.techLevels || {},
        unlockedTechLevels: (() => {
          const techs = tech.unlockedTechLevels || {};
          const normalized: any = {};
          Object.keys(techs).forEach(k => {
            const normalizedKey = k.charAt(0).toUpperCase() + k.slice(1);
            normalized[normalizedKey] = techs[k];
          });
          return normalized;
        })(),
        autoTravelSlots: r.autoTravelSlots || {},
        shipLevel: s.shipLevel || 1,
        shipXP: s.shipXP || 0,
        battleLevel: ex.battleLevel || 1,
        radarLevel: ex.radarLevel || 1,
        privatePoliceLevel: ex.privatePoliceLevel || 0,
        doubleRouteLevel: r.doubleRouteLevel || 0,
        doomPLevel: ex.doomPLevel || 0,
        captureLevel: ex.captureLevel || 0,
        extractionTechLevel: ex.extractionTechLevel || 0,
        solarMappingLevel: ex.solarMappingLevel || 0,
        warCoreLevel: v.warCoreLevel || 1,
        battleShipUpgradeLevel: v.battleShipUpgradeLevel || 0,
        route4Unlocked: g.route4Unlocked || false,
        gameTimeSeconds: g.gameTimeSeconds || 0,
        totalDeliveries: g.totalDeliveries || 0,
        deliveriesByLocation: g.deliveriesByLocation || {},
        autoSkipRandomBattles: g.autoSkipRandomBattles || false,
        researchingTech: g.researchingTech || null
      },
      mining: {
        miningRobots: min.miningRobots || {},
        miningRobotLevels: min.miningRobotLevels || {},
        oresCollected: min.oresCollected || {},
        autoSellByOre: min.autoSellByOre || {},
        autoSellUnlockedByOre: min.autoSellUnlockedByOre || {},
        miningCompressionLevels: min.miningCompressionLevels || {},
        extractionPacks: ex.extractionPacks || {},
        extractionRobotLevels: ex.extractionRobotLevels || {},
        extractionProductionLevels: ex.extractionProductionLevels || {},
        extractionAutoSell: ex.extractionAutoSell || {},
        extractionAutoSellUnlocked: ex.extractionAutoSellUnlocked || {},
        extractionCompressionLevels: ex.extractionCompressionLevels || {},
        unlockedExtractionPoints: ex.unlockedExtractionPoints || [],
        researchingExtractionPoint: null,
        voidAutoShipmentUnlocked: v.voidAutoShipmentUnlocked || false,
        voidAutoShipmentActive: v.voidAutoShipmentActive || false
      },
      combat: {
        activeBattle: null,
        foundBattle: null,
        voidBattleStatus: 'idle',
        voidBattleShipStats: v.voidBattleShipStats || { hp: 100, maxHp: 100, shield: 0, maxShield: 50, damage: 10, critChance: 0.05, lootEfficiency: 1, rarity: 'common', upgrades: { damage: 0, shield: 0, crit: 0, loot: 0 } },
        isRetributionActive: ex.isRetributionActive || false,
        isFatigueActive: ex.isFatigueActive || false,
        voidResources: {
          minerals: v.voidResources?.minerals || 0,
          energy: v.voidResources?.energy || 0,
          food: v.voidResources?.food || 0,
          tech: v.voidResources?.tech || 0,
          meds: v.voidResources?.meds || 0
        },
        voidCompactedResources: v.voidCompactedResources || {},
        voidPOIsInspiration: v.voidPOIsInspiration || {},
        voidPOIQCDonations: v.voidPOIQCDonations || {},
        isVoidWarActive: v.isVoidWarActive || false,
        voidWarProgress: v.voidWarProgress || { currentSector: 1, currentBattle: 1 },
        robotRepairProgress: v.robotRepairProgress || 0,
        isRobotRepaired: v.isRobotRepaired || false,
        // New Aircraft fields
        unlockedVoidAircraft: v.unlockedVoidAircraft || ['va-1'],
        voidAircraftMissions: v.voidAircraftMissions || { 'va-1': { status: 'idle' }, 'va-2': { status: 'idle' }, 'va-3': { status: 'idle' } },
        voidAircraftUpgrades: v.voidAircraftUpgrades || { 'va-1': { storage: 0, quality: 0, time: 0, auto: 0 }, 'va-2': { storage: 0, quality: 0, time: 0, auto: 0 }, 'va-3': { storage: 0, quality: 0, time: 0, auto: 0 } },
        voidAircraftConstruction: v.voidAircraftConstruction || {},
        voidAircraftAutoToggles: v.voidAircraftAutoToggles || {}
      },
      missions: {
        missions: g.missions || [],
        historyStats: g.historyStats || {},
        unlockedAchievements: g.unlockedAchievements || [],
        achievementProgress: g.achievementProgress || {},
        skillLendariaLevel: sk.skillLendariaLevel || { Solar: 0, Interstellar: 0 },
        skillMiticaLevel: sk.skillMiticaLevel || { Solar: 0, Interstellar: 0 },
        skillAlienLevel: sk.skillAlienLevel || { Solar: 0, Interstellar: 0 },
        skillTempoDinheiroLevel: sk.skillTempoDinheiroLevel || { Solar: 0, Interstellar: 0 },
        skillRobosOlimpicosLevel: sk.skillRobosOlimpicosLevel || { Solar: 0, Interstellar: 0 },
        missionRewardLevel: g.missionRewardLevel || { Solar: 0, Interstellar: 0 },
        missionMythicBonus: g.missionMythicBonus || 0,
        missionAlienBonus: g.missionAlienBonus || 0,
        missionLegendaryBonus: g.missionLegendaryBonus || 0,
        autoClaimMissions: g.autoClaimMissions || false,
        radarUnlocked: (() => {
          const radar = g.radarUnlocked || {};
          const normalized: any = {};
          Object.keys(radar).forEach(k => {
            const normalizedKey = k.charAt(0).toUpperCase() + k.slice(1);
            normalized[normalizedKey] = radar[k];
          });
          return normalized;
        })(),
        completedInitialMissions: g.completedInitialMissions || [],
        lastScanTime: g.lastScanTime || 0
      },
      earth: {
        population: er.earthPopulation || 0,
        maleRatio: er.earthMaleRatio || 0.5,
        biodiversity: er.earthBiodiversity || 0,
        health: er.earthHealth || 0,
        happiness: er.earthHappiness || 0,
        security: er.earthSecurity || 0,
        qualityOfLife: er.earthQualityOfLife || 0,
        season: er.earthSeason || 0,
        events: er.earthEvents || [],
        reconstructionProgress: er.earthReconstructionProgress || {},
        couples: er.earthCouples || 0,
        birthRegistry: er.earthBirthRegistry || {},
        projectBoostCount: er.earthProjectBoostCount || 0,
        atmosphere: er.atmosphere || 0,
        temperature: er.temperature || 0,
        hydrosphere: er.hydrosphere || 0,
        biosphere: er.biosphere || 0
      },
      system: {
        seenTutorials: g.seenTutorials || {},
        arcadeScores: rawData.arcadeScores || {},
        localRecords: rawData.localRecords || [],
        hasSeenRoute2UnlockMessage: g.hasSeenRoute2UnlockMessage || false,
        playerName: g.playerName || '',
      }
    };
  }
};
