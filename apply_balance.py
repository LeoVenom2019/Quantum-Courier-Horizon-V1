import re

with open(r'D:\PROJETOS\QCH\components\NewEarthDefenseBattle.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Blizzard Ticks to 1000ms
content = content.replace("tickInterval: 250,", "tickInterval: 1000,")

# Blizzard damage to 1x
content = content.replace("createSpecialDamagePayload(0.675, { ice: 44 })", "createSpecialDamagePayload(1.0, { ice: 44 })")

# Blizzard ice block direct explosion to 0.525, area to 0.2625
content = content.replace("applyBlizzardDamage(1.05, x, y, 90, 'GELO', '#bae6fd');", "applyBlizzardDamage(0.525, x, y, 90, 'GELO', '#bae6fd');")
content = content.replace("applyBlizzardDamage(0.525, x, y, WIDTH * 0.5, 'AREA', '#93c5fd');", "applyBlizzardDamage(0.2625, x, y, WIDTH * 0.5, 'AREA', '#93c5fd');")

# Thor Base Damage -50%
content = content.replace("applyThorDamage(1.35,", "applyThorDamage(0.675,")
content = content.replace("applyThorDamage(1.9,", "applyThorDamage(0.95,")

# Hellfire to 6 shots
content = content.replace("remaining: 5, waitingForImpact", "remaining: 6, waitingForImpact")

# Hellfire Area Damage
old_hellfire_impact = '''              if (projectile.sequence === 'hellfire') {
                state.hellfireSequence.remaining -= 1;
                state.hellfireSequence.waitingForImpact = false;
              }'''
new_hellfire_impact = '''              if (projectile.sequence === 'hellfire') {
                state.hellfireSequence.remaining -= 1;
                state.hellfireSequence.waitingForImpact = false;
                const explosionRadius = 140;
                const areaDamage = shipStats.damage;
                state.enemies.forEach(otherEnemy => {
                  if (otherEnemy !== enemy && otherEnemy.hp > 0) {
                    const odx = otherEnemy.x - enemy.x;
                    const ody = otherEnemy.y - enemy.y;
                    if (Math.sqrt(odx * odx + ody * ody) < explosionRadius + otherEnemy.radius) {
                      otherEnemy.hp -= areaDamage;
                      spawnFloat(otherEnemy.x + (Math.random() * 20 - 10), otherEnemy.y - 20, str(round(areaDamage)) + " AREA", '#fb923c');
                    }
                  }
                });
              }'''.replace('str(round(areaDamage)) + " AREA"', "${Math.round(areaDamage)} AREA")

if old_hellfire_impact in content:
    content = content.replace(old_hellfire_impact, new_hellfire_impact)
else:
    print("Warning: old_hellfire_impact not found!")

with open(r'D:\PROJETOS\QCH\components\NewEarthDefenseBattle.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
