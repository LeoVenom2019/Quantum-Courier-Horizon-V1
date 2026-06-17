with open(r'D:\PROJETOS\QCH\components\NewEarthDefenseBattle.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

def extract_around(pattern):
    import re
    match = re.search(pattern, content)
    if match:
        start = max(0, match.start() - 500)
        end = min(len(content), match.end() + 1000)
        return content[start:end]
    return "Not found: " + pattern

with open('structure_check.txt', 'w', encoding='utf-8') as out:
    out.write('--- spawnParticle ---\n')
    out.write(extract_around(r'const spawnParticle ='))
    out.write('\n\n--- update enemies ---\n')
    out.write(extract_around(r'state\.enemies\.forEach\(enemy => \{.*?enemy\.x \+='))
    out.write('\n\n--- player take damage ---\n')
    out.write(extract_around(r'const damagePlayer ='))

with open(r'D:\PROJETOS\QCH\components\NewEarthUnderwaterBattle.tsx', 'r', encoding='utf-8') as f:
    content2 = f.read()

with open('structure_check2.txt', 'w', encoding='utf-8') as out:
    out.write('--- update enemies ---\n')
    import re
    match = re.search(r'state\.enemies\.forEach\(enemy => \{.*?enemy\.x \+=', content2)
    if match:
        out.write(content2[max(0, match.start() - 500):min(len(content2), match.end() + 1000)])
