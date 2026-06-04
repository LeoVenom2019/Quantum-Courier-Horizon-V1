import os
from PIL import Image

def process_route_bg(src, dst):
    try:
        with Image.open(src) as img:
            # We want 1024x512
            target_ratio = 1024 / 512
            w, h = img.size
            current_ratio = w / h

            if current_ratio > target_ratio:
                new_h = 512
                new_w = int(new_h * current_ratio)
            else:
                new_w = 1024
                new_h = int(new_w / current_ratio)

            img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
            
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
    ("bg_route1_terra_1780360927095.png", "bg_route1_terra.webp"),
    ("bg_route1_lua_1780360939566.png", "bg_route1_lua.webp"),
    ("bg_route1_venus_1780360955600.png", "bg_route1_venus.webp"),
    ("bg_route1_marte_1780360967212.png", "bg_route1_marte.webp"),
]

for src_name, dst_name in images:
    src_path = os.path.join(artifact_dir, src_name)
    dst_path = os.path.join(dest_dir, dst_name)
    process_route_bg(src_path, dst_path)
