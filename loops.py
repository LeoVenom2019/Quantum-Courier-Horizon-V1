import re
with open(r'D:\PROJETOS\QCH\components\NewEarthDefenseBattle.tsx', 'r', encoding='utf-8') as f:
    c = f.read()
    match = re.search(r'let animationFrameId: number;.*?const animate = \(now: number\) => \{', c, re.DOTALL)
    if not match: match = re.search(r'const update = \(.*?\) => \{', c, re.DOTALL)
    if not match: match = re.search(r'const tick = \(.*?\) => \{', c, re.DOTALL)
    if match: print("DEFENSE LOOP:", c[match.start():match.start()+1500])

with open(r'D:\PROJETOS\QCH\components\VoidBattleArena.tsx', 'r', encoding='utf-8') as f:
    c = f.read()
    match = re.search(r'const animate = \(now: number\) => \{', c, re.DOTALL)
    if not match: match = re.search(r'const update = \(.*?\) => \{', c, re.DOTALL)
    if match: print("VOID LOOP:", c[match.start():match.start()+1500])

