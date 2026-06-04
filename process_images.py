import os
from PIL import Image

def process_image(src, dst):
    try:
        with Image.open(src) as img:
            # We want exactly 1200x200. Let's do a center crop after resize.
            target_ratio = 1200 / 200
            w, h = img.size
            current_ratio = w / h

            if current_ratio > target_ratio:
                # Image is wider, resize based on height
                new_h = 200
                new_w = int(new_h * current_ratio)
            else:
                # Image is taller, resize based on width
                new_w = 1200
                new_h = int(new_w / current_ratio)

            img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
            
            # Crop center
            left = (new_w - 1200) / 2
            top = (new_h - 200) / 2
            right = (new_w + 1200) / 2
            bottom = (new_h + 200) / 2

            img = img.crop((left, top, right, bottom))
            
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            img.save(dst, format="WEBP", quality=85)
            print(f"Saved {dst}")
    except Exception as e:
        print(f"Error processing {src}: {e}")

artifact_dir = r"C:\Users\leove\.gemini\antigravity\brain\da34ebf2-b905-470e-bf1e-2eff09371472"
dest_dir = r"D:\PROJETOS\QCH\public\assets\texturas"

images = [
    ("bg_legendary_1780358363348.png", "bg_missao_lendaria.webp"),
    ("bg_mythic_1780358377235.png", "bg_missao_mitica.webp"),
    ("bg_alien_1780358390750.png", "bg_missao_alien.webp"),
    ("bg_time_1780358401135.png", "bg_tempo_dinheiro.webp"),
    ("bg_robots_1780358412892.png", "bg_robos_olimpicos.webp")
]

for src_name, dst_name in images:
    src_path = os.path.join(artifact_dir, src_name)
    dst_path = os.path.join(dest_dir, dst_name)
    process_image(src_path, dst_path)
