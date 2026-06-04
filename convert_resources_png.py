import os
import glob
from PIL import Image

directory = r"D:\PROJETOS\QCH\public\assets\rota3\void"
png_files = glob.glob(os.path.join(directory, "*.png"))

for in_path in png_files:
    filename = os.path.basename(in_path)
    name, ext = os.path.splitext(filename)
    out_path = os.path.join(directory, f"{name}.webp")
    
    with Image.open(in_path) as img:
        # Resize exactly to 600x300
        resized_img = img.resize((600, 300), Image.Resampling.LANCZOS)
        resized_img.save(out_path, "WEBP", quality=95)
    
    # Remove the original png
    os.remove(in_path)
    print(f"Converted and resized {filename} -> {name}.webp")

print("Done.")
