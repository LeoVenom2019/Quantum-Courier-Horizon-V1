import os

file_path = r'd:\PROJETOS\QCH\components\GameDashboard.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip = 0
for i, line in enumerate(lines):
    if skip > 0:
        skip -= 1
        continue
    
    if 'jukebox.setPlaylist(theme.playlist);' in line:
        new_lines.append(line.replace('jukebox.setPlaylist(theme.playlist);', 'jukebox.playPlaylist(theme.playlist);'))
        # Check if next lines are the ones we want to remove
        if i + 2 < len(lines) and 'jukebox.setCurrentTrackIndex(0);' in lines[i+2]:
            skip = 2 # skip comment and the next line
    else:
        new_lines.append(line)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Replacement successful")
