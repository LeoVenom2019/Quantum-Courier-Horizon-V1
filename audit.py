import re

with open(r'D:\PROJETOS\QCH\components\NewEarthDefenseBattle.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

with open('audit_report.txt', 'w', encoding='utf-8') as out:
    def extract_block(name, pattern):
        match = re.search(pattern, content, re.DOTALL)
        if match:
            out.write(f'\n--- {name} ---\n{match.group(0)}\n')
        
    extract_block('Laser Interval', r'const HORIZON_LASER_DAMAGE_INTERVAL.*?;')
    extract_block('Laser Damage', r'if \(state\.laserState === \'firing\' && now - state\.laserLastDamageTick >= HORIZON_LASER_DAMAGE_INTERVAL\) \{.*?dealDamage.*?\}')
    extract_block('Hellfire Barrage', r'if \(specialId === \'hellfire-barrage\'\).*?\{.*?\}')
    extract_block('Hellfire Logic', r'if \(state\.hellfireSequence\.active\).*?\{.*?\}')
    extract_block('Hellfire Impact', r'if \(projectile\.special === \'hellfire\'\).*?\{.*?dealDamage.*?\}')
    extract_block('Thor Oath Update', r'const updateThorSpecial.*?\{.*?dealDamage.*?\}')
    extract_block('Blizzard Update', r'const updateBlizzardSpecial.*?\{.*?dealDamage.*?\}')
    out.write('\n--- createSpecialDamagePayload ---\n')
    for m in re.finditer(r'createSpecialDamagePayload\(.*?\)', content):
        out.write(m.group(0) + '\n')
