import os
from PIL import Image

in_path = r"C:\Users\leove\.gemini\antigravity\brain\47ef9891-5519-4d0e-bf3d-c83a4dd5c235\bg_void_invasion_1780497361332.png"
out_path = r"D:\PROJETOS\QCH\public\assets\rota3\void\bg_void_invasion.webp"

if os.path.exists(in_path):
    with Image.open(in_path) as img:
        img.save(out_path, "WEBP", quality=95)
    print("Converted bg_void_invasion.webp")
else:
    print(f"File not found: {in_path}")
