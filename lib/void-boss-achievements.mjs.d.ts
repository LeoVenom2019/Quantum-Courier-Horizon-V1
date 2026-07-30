export interface BossZeroDefeatEvidence {
  routeTier?: string;
  route4Unlocked?: boolean;
  hasWonEliminateEnemiesRoute3?: boolean;
  isRobotRepaired?: boolean;
  isVoidWarActive?: boolean;
}

export function hasBossZeroDefeatEvidence(evidence: BossZeroDefeatEvidence): boolean;
