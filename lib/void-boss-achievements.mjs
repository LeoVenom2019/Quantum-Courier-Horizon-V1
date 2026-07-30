export const hasBossZeroDefeatEvidence = ({
  routeTier,
  route4Unlocked,
  hasWonEliminateEnemiesRoute3,
  isRobotRepaired,
  isVoidWarActive,
}) => (
  Boolean(hasWonEliminateEnemiesRoute3)
  || Boolean(isRobotRepaired)
  || Boolean(isVoidWarActive)
  || Boolean(route4Unlocked)
  || routeTier === 'Earth'
);
