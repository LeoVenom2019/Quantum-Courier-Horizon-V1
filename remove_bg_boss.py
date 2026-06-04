import os
import sys
import numpy as np
from PIL import Image
import cv2

in_path = r"D:\PROJETOS\QCH\public\assets\rota3\void\5\boss_shoot.png"
out_path = r"D:\PROJETOS\QCH\public\assets\rota3\void\5\boss_shoot.webp"

print(f"Processing {in_path}")

img = cv2.imread(in_path, cv2.IMREAD_UNCHANGED)
if img is None:
    print("Failed to load image")
    sys.exit(1)

# Ensure it has an alpha channel for final output
if img.shape[2] == 3:
    img_bgra = cv2.cvtColor(img, cv2.COLOR_BGR2BGRA)
    img_bgr = img
else:
    img_bgra = img.copy()
    img_bgr = cv2.cvtColor(img, cv2.COLOR_BGRA2BGR)

h, w = img_bgr.shape[:2]
mask = np.zeros((h + 2, w + 2), np.uint8)

lo_diff = (10, 10, 10)
up_diff = (10, 10, 10)

corners = [(0, 0), (0, h - 1), (w - 1, 0), (w - 1, h - 1)]

for corner in corners:
    if mask[corner[1] + 1, corner[0] + 1] == 0:
        cv2.floodFill(img_bgr, mask, corner, (255, 255, 255), lo_diff, up_diff, flags=cv2.FLOODFILL_FIXED_RANGE)

# The mask now has 1s where the background is (because floodFill updates the mask with 1s if we pass FLOODFILL_MASK_ONLY or it updates it implicitly to 1 for filled areas).
# Actually, the default floodFill updates mask to 1 for the filled pixels.
# Let's set the alpha channel of img_bgra to 0 where mask is 1
# Note: mask is sized (h+2, w+2), so we slice it
bg_mask = mask[1:h+1, 1:w+1]
img_bgra[bg_mask == 1, 3] = 0

pil_img = Image.fromarray(cv2.cvtColor(img_bgra, cv2.COLOR_BGRA2RGBA))

target_h = 3840
ratio = target_h / pil_img.height
target_w = int(pil_img.width * ratio)

print(f"Resizing from {pil_img.width}x{pil_img.height} to {target_w}x{target_h}")
resized_img = pil_img.resize((target_w, target_h), Image.Resampling.LANCZOS)

resized_img.save(out_path, "WEBP", quality=95)
print(f"Saved to {out_path}")

if os.path.exists(in_path):
    os.remove(in_path)
    print("Removed original boss_shoot.png")

print("Done.")
