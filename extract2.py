with open(r'D:\PROJETOS\QCH\components\NewEarthDefenseBattle.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

def extract(func_name):
    capture = False
    brace = 0
    res = []
    for line in lines:
        if not capture and func_name in line and ('=>' in line or '(' in line):
            capture = True
        
        if capture:
            res.append(line)
            brace += line.count('{') - line.count('}')
            if brace <= 0 and '{' in ''.join(res):
                break
    return ''.join(res)

with open('functions2.txt', 'w', encoding='utf-8') as out:
    out.write('\n--- applyLaserDamageTick ---\n')
    out.write(extract('const applyLaserDamageTick'))
    out.write('\n--- applyThorDamage ---\n')
    out.write(extract('const applyThorDamage'))
    out.write('\n--- applyBlizzardTick ---\n')
    out.write(extract('const applyBlizzardTick'))
    out.write('\n--- explodeBlizzardIceBlock ---\n')
    out.write(extract('const explodeBlizzardIceBlock'))
    out.write('\n--- hellfire logic ---\n')
    out.write(extract('updateHellfireSequence'))
