import re

with open(r'D:\PROJETOS\QCH\components\NewEarthDefenseBattle.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add player smoke trail
player_logic = '''      const slowed = enemy.status.slowUntil && enemy.status.slowUntil > now;'''
player_smoke = '''      if (Math.random() > 0.3) {
        spawnParticle(p.x - 30, p.y + (Math.random() * 12 - 6), 'rgba(180, 180, 180, 0.6)', 1.5, 0.5, 3.5, state.backgroundParticles);
      }
      const slowed = enemy.status.slowUntil && enemy.status.slowUntil > now;'''

if player_smoke not in content:
    content = content.replace(player_logic, player_smoke, 1)

# Add enemy smoke trail
enemy_update = '''        enemy.y = clamp(enemy.y, 52, HEIGHT - 52);'''
enemy_smoke = '''        enemy.y = clamp(enemy.y, 52, HEIGHT - 52);
        if (!enemy.kind.includes('monster') && Math.random() > 0.4) {
          spawnParticle(enemy.x + 28, enemy.y + (Math.random() * 10 - 5), 'rgba(120, 120, 120, 0.5)', 0.8, 0.6, 2.5, state.backgroundParticles);
        }'''

if enemy_smoke not in content:
    content = content.replace(enemy_update, enemy_smoke, 1)

# Add player impact
player_hit = '''            damagePlayer(projectile.damage);'''
player_impact = '''            damagePlayer(projectile.damage);
            for (let i = 0; i < 6; i++) {
              spawnParticle(p.x, p.y, ['#fb923c', '#ef4444', '#facc15', '#ffffff'][Math.floor(Math.random() * 4)], 3.5, 0.4, 4, state.impactParticles);
            }'''

if player_impact not in content:
    content = content.replace(player_hit, player_impact, 1)

with open(r'D:\PROJETOS\QCH\components\NewEarthDefenseBattle.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
