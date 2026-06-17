with open(r'D:\PROJETOS\QCH\components\VoidBattleArena.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

import re
with open('void_check.txt', 'w', encoding='utf-8') as out:
    match = re.search(r's\.enemies\.forEach.*?enemy\.x \+=', c, re.DOTALL)
    if match: out.write(c[max(0, match.start() - 500):min(len(c), match.end() + 1000)])
    
    out.write('\n\n--- player damage ---\n')
    match2 = re.search(r'applyPlayerDamage\(', c, re.DOTALL)
    if match2: out.write(c[max(0, match2.start() - 200):min(len(c), match2.end() + 200)])

