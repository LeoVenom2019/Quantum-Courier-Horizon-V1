import os
from PIL import Image

def process_card_bg(src, dst):
    try:
        with Image.open(src) as img:
            # We want 1024x512 (2:1 aspect ratio)
            target_ratio = 1024 / 512
            w, h = img.size
            current_ratio = w / h

            if current_ratio > target_ratio:
                # Image is wider, resize based on height
                new_h = 512
                new_w = int(new_h * current_ratio)
            else:
                # Image is taller, resize based on width
                new_w = 1024
                new_h = int(new_w / current_ratio)

            img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
            
            # Crop center
            left = (new_w - 1024) / 2
            top = (new_h - 512) / 2
            right = (new_w + 1024) / 2
            bottom = (new_h + 512) / 2

            img = img.crop((left, top, right, bottom))
            
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            img.save(dst, format="WEBP", quality=85)
            print(f"Saved {dst}")
    except Exception as e:
        print(f"Error processing {src}: {e}")

artifact_dir = r"C:\Users\leove\.gemini\antigravity\brain\da34ebf2-b905-470e-bf1e-2eff09371472"
dest_dir = r"D:\PROJETOS\QCH\public\assets\texturas"

images = [
    ("bg_card_comum_1780359805816.png", "bg_card_comum.webp"),
    ("bg_card_rara_1780359819993.png", "bg_card_rara.webp"),
    ("bg_card_lendaria_1780359831724.png", "bg_card_lendaria.webp"),
    ("bg_card_mitica_1780359842959.png", "bg_card_mitica.webp"),
    ("bg_card_alien_1780359854527.png", "bg_card_alien.webp")
]

for src_name, dst_name in images:
    src_path = os.path.join(artifact_dir, src_name)
    dst_path = os.path.join(dest_dir, dst_name)
    process_card_bg(src_path, dst_path)
