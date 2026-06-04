import os
from PIL import Image
from rembg import remove

source_dir = r"D:\PROJETOS\QCH\public\assets\rota3\void\4"
images = [
    "boss_backward.png",
    "boss_down.png",
    "boss_forward.png",
    "boss_up.png"
]

for img_name in images:
    src_path = os.path.join(source_dir, img_name)
    dst_name = img_name.replace(".png", ".webp")
    dst_path = os.path.join(source_dir, dst_name)
    
    print(f"Processing {img_name}...")
    try:
        with Image.open(src_path) as img:
            output_img = remove(img)
            
            w, h = output_img.size
            new_h = 640
            new_w = int(w * (new_h / h))
            
            output_img = output_img.resize((new_w, new_h), Image.Resampling.LANCZOS)
            
            output_img.save(dst_path, format="WEBP", quality=90)
            print(f"Saved {dst_path}")
    except Exception as e:
        print(f"Failed {img_name}: {e}")
