import os
from PIL import Image

output_dir = r"D:\PROJETOS\QCH\public\assets\rota3\void"
os.makedirs(output_dir, exist_ok=True)

images = {
    "bg_void_map_left.webp": r"C:\Users\leove\.gemini\antigravity\brain\47ef9891-5519-4d0e-bf3d-c83a4dd5c235\bg_void_map_left_1780495237314.png",
    "bg_void_poi_eridani.webp": r"C:\Users\leove\.gemini\antigravity\brain\47ef9891-5519-4d0e-bf3d-c83a4dd5c235\bg_void_poi_eridani_1780495249475.png",
    "bg_void_poi_vega.webp": r"C:\Users\leove\.gemini\antigravity\brain\47ef9891-5519-4d0e-bf3d-c83a4dd5c235\bg_void_poi_vega_1780495261689.png",
    "bg_void_poi_aurora.webp": r"C:\Users\leove\.gemini\antigravity\brain\47ef9891-5519-4d0e-bf3d-c83a4dd5c235\bg_void_poi_aurora_1780495285694.png",
    "bg_void_poi_sirius.webp": r"C:\Users\leove\.gemini\antigravity\brain\47ef9891-5519-4d0e-bf3d-c83a4dd5c235\bg_void_poi_sirius_1780495296485.png"
}

for out_name, in_path in images.items():
    if os.path.exists(in_path):
        out_path = os.path.join(output_dir, out_name)
        with Image.open(in_path) as img:
            img.save(out_path, "WEBP", quality=95)
        print(f"Converted {out_name}")
    else:
        print(f"File not found: {in_path}")
