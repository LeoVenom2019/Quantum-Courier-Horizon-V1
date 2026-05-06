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
    earthBirthRegistry: number;
    earthEvents: any[];
    colonies: any[];
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
        aetherionTubes: flatData.aetherionTubes || 0
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
        earthBirthRegistry: flatData.earthBirthRegistry || 0,
        earthEvents: flatData.earthEvents || [],
        colonies: flatData.colonies || []
      },
      arcadeScores: flatData.arcadeScores || {},
      localRecords: flatData.localRecords || [],
      unlockedCodes: flatData.unlockedCodes || []
    };
  },

  loadSave: (rawData: any): any => {
    if (!rawData) return null;

    // Check if it's a legacy flat save
    if (!rawData.version) {
      // It's a legacy save, just return it as flat (or migrate it)
      // Since GameDashboard.tsx expects flat structure currently (or handles flat directly)
      // We will map it to flat for the UI
      return rawData;
    }

    // It's a modular save (>= 1.1.0)
    // We flatten it back out for GameDashboard to use in setState,
    // providing default fallbacks if missing
    return {
      version: rawData.version,
      arcadeScores: rawData.arcadeScores,
      localRecords: rawData.localRecords,
      unlockedCodes: rawData.unlockedCodes,
      ...rawData.global,
      ...rawData.routes,
      ...rawData.ships,
      ...rawData.tech,
      ...rawData.mining,
      ...rawData.skills,
      ...rawData.extraction_interstellar,
      ...rawData.void_aircraft,
      ...rawData.earth_reconstruction
    };
  }
};
