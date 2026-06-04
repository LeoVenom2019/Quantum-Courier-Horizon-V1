import os
from PIL import Image
from rembg import remove
import numpy as np
from skimage.color import rgb2hsv, hsv2rgb
import io

def process_chest(input_path, base_output_name):
    print(f"Processing {input_path}")
    try:
        with open(input_path, 'rb') as f:
            input_data = f.read()
    except Exception as e:
        print(f"Error reading {input_path}: {e}")
        return
    
    # Remove background
    output_data = remove(input_data)
    
    # Load into Pillow
    base_img = Image.open(io.BytesIO(output_data)).convert("RGBA")
    
    # Save original (base) as webp (1)
    base_img.save(f"{base_output_name}.webp", format="webp")
    print(f"Saved {base_output_name}.webp (Original)")
    
    # We want 4 colors: Red, Blue, Purple, Orange
    # We'll use absolute hue assignment to ensure the colors are distinct
    # Scikit-image works with float arrays 0..1
    arr = np.array(base_img)
    rgb = arr[:, :, :3] / 255.0
    alpha = arr[:, :, 3]
    
    hsv = rgb2hsv(rgb)
    
    # Target hues in 0..1 range
    # Red: 0.0, Blue: 0.66, Purple: 0.80, Orange: 0.08
    targets = [
        ("Red", 0.0, f"{base_output_name}2.webp"),
        ("Blue", 0.60, f"{base_output_name}3.webp"),
        ("Purple", 0.78, f"{base_output_name}4.webp"),
        ("Orange", 0.08, f"{base_output_name}5.webp")
    ]
    
    for color_name, target_h, out_name in targets:
        mask = alpha > 20 # Only shift hues where it's visible
        if not np.any(mask): continue
        
        # Calculate median hue of non-transparent pixels to find the shift
        avg_h = np.median(hsv[mask, 0])
        delta = target_h - avg_h
        
        new_hsv = hsv.copy()
        new_hsv[:, :, 0] = (new_hsv[:, :, 0] + delta) % 1.0
        
        # Increase saturation a bit to make colors pop
        new_hsv[:, :, 1] = np.clip(new_hsv[:, :, 1] * 1.3, 0, 1)
        
        new_rgb = hsv2rgb(new_hsv)
        
        # Combine back with alpha
        new_arr = np.zeros_like(arr)
        new_arr[:, :, :3] = (new_rgb * 255).astype(np.uint8)
        new_arr[:, :, 3] = alpha
        
        out_img = Image.fromarray(new_arr, 'RGBA')
        out_img.save(out_name, format="webp")
        print(f"Saved {out_name} ({color_name})")

folder = r"D:\PROJETOS\QCH\public\assets\rota4"
process_chest(os.path.join(folder, "treasure_closed.png"), os.path.join(folder, "treasure_closed"))
process_chest(os.path.join(folder, "treasure_open.png"), os.path.join(folder, "treasure_open"))
print("Done!")
