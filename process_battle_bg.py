import os
from PIL import Image

src_dir = r"C:\Users\leove\.gemini\antigravity\brain\47ef9891-5519-4d0e-bf3d-c83a4dd5c235"
dst_dir = r"d:\PROJETOS\QCH\public\assets\rota3\void"

files = [
    ("bg_void_battle_common_1780422635512.png", "bg_void_battle_common.webp"),
    ("bg_void_battle_elite_1780422653278.png", "bg_void_battle_elite.webp"),
    ("bg_void_battle_boss_1780422667621.png", "bg_void_battle_boss.webp"),
    ("bg_void_battle_main_1780422686290.png", "bg_void_battle_main.webp"),
]

os.makedirs(dst_dir, exist_ok=True)

for src_name, dst_name in files:
    src = os.path.join(src_dir, src_name)
    dst = os.path.join(dst_dir, dst_name)
    try:
        with Image.open(src) as img:
            img.save(dst, format="WEBP", quality=85)
            print(f"Processed {dst_name}")
    except Exception as e:
        print(f"Failed {dst_name}: {e}")
