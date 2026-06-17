with open(r'D:\PROJETOS\QCH\components\NewEarthDefenseBattle.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

def extract(func_name, exact_match=False):
    capture = False
    brace = 0
    res = []
    for line in lines:
        if not capture and func_name in line and '=> {' in line:
            capture = True
        
        if capture:
            res.append(line)
            brace += line.count('{') - line.count('}')
            if brace <= 0:
                break
    return ''.join(res)

with open('functions.txt', 'w', encoding='utf-8') as out:
    out.write('--- HORIZON_LASER_DAMAGE_MULTIPLIER ---\n')
    out.write(''.join([l for l in lines if 'HORIZON_LASER_DAMAGE_MULTIPLIER' in l]))
    out.write('\n--- createSpecialDamagePayload ---\n')
    out.write(''.join([l for l in lines if 'createSpecialDamagePayload' in l]))
    out.write('\n--- Laser ---\n')
    out.write(extract('updateLaserSpecial'))
    out.write('\n--- Thor ---\n')
    out.write(extract('updateThorSpecial'))
    out.write('\n--- Blizzard ---\n')
    out.write(extract('updateBlizzardSpecial'))
    out.write('\n--- Hellfire Impact ---\n')
    out.write(''.join([l for l in lines if 'projectile.special === \'hellfire\'' in l or 'damagePayload' in l]))

