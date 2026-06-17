import re

with open(r'D:\PROJETOS\QCH\components\VoidBattleArena.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

def collect_around_keyword(keyword, context=15):
    results = []
    for i, l in enumerate(lines):
        if keyword in l:
            start = max(0, i - context)
            end = min(len(lines), i + context)
            results.append(f'--- Line {i+1}: {l.strip()} ---')
            results.append(''.join(lines[start:end]))
    return '\n'.join(results)

with open('void_analysis.txt', 'w', encoding='utf-8') as out:
    out.write(collect_around_keyword('en.x +='))
    out.write('\n\n---\n\n')
    out.write(collect_around_keyword('en.vx'))
    out.write('\n\n---\n\n')
    out.write(collect_around_keyword('damagePlayer'))
    out.write('\n\n---\n\n')
    out.write(collect_around_keyword('playerHp -='))
