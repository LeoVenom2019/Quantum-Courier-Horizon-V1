import os
from PIL import Image

directory = r"D:\PROJETOS\QCH\public\assets\rota3\void"
files = ["drones_bg.png", "earth_bg.png"]

for filename in files:
    in_path = os.path.join(directory, filename)
    if not os.path.exists(in_path):
        print(f"File not found: {in_path}")
        continue
        
    name, ext = os.path.splitext(filename)
    out_path = os.path.join(directory, f"{name}.webp")
    
    with Image.open(in_path) as img:
        resized_img = img.resize((600, 300), Image.Resampling.LANCZOS)
        resized_img.save(out_path, "WEBP", quality=95)
    
    os.remove(in_path)
    print(f"Converted and resized {filename} -> {name}.webp")

print("Done.")
