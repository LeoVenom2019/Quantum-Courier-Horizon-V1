import os

file_path = r'd:\PROJETOS\QCH\components\GameDashboard.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip_next = 0
for i, line in enumerate(lines):
    if 'setIsRobotRepaired(false);' in line and '9960' in str(i+1)[:4]: # double check vicinity
        continue
    if 'setRobotRepairProgress(0);' in line and i > 9000:
        continue
    if "addLog(language === 'pt' ? 'Inimigos eliminados! O robô sofreu danos críticos no processo.'" in line:
        new_lines.append(line.replace("'Inimigos eliminados! O robô sofreu danos críticos no processo.'", "'Inimigos eliminados! A estrutura está segura.'").replace("'Enemies eliminated! The robot suffered critical damage in the process.'", "'Enemies eliminated! The structure is safe.'").replace("'warning'", "'success'"))
        continue
    new_lines.append(line)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
