import os
from PIL import Image

def process_route_bg(src, dst):
    try:
        with Image.open(src) as img:
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

artifact_dir = r"C:\Users\leove\.gemini\antigravity\brain\47ef9891-5519-4d0e-bf3d-c83a4dd5c235"
dest_dir = r"D:\PROJETOS\QCH\public\assets\texturas"

images = [
    ("bg_aircraft_seeker_alpha_1780404397148.png", "bg_aircraft_seeker_alpha.webp"),
    ("bg_aircraft_collector_beta_1780404408862.png", "bg_aircraft_collector_beta.webp"),
    ("bg_aircraft_ghost_gamma_1780404421299.png", "bg_aircraft_ghost_gamma.webp"),
]

for src_name, dst_name in images:
    src_path = os.path.join(artifact_dir, src_name)
    dst_path = os.path.join(dest_dir, dst_name)
    process_route_bg(src_path, dst_path)
