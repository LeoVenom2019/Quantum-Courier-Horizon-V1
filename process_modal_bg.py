import os
from PIL import Image

def process_modal_bg(src, dst):
    try:
        with Image.open(src) as img:
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            img.save(dst, format="WEBP", quality=85)
            print(f"Saved {dst}")
    except Exception as e:
        print(f"Error processing {src}: {e}")

src_path = r"C:\Users\leove\.gemini\antigravity\brain\da34ebf2-b905-470e-bf1e-2eff09371472\bg_skill_map_modal_1780359127590.png"
dst_path = r"D:\PROJETOS\QCH\public\assets\texturas\bg_skill_map_modal.webp"

process_modal_bg(src_path, dst_path)
