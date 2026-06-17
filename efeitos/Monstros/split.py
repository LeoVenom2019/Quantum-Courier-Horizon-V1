from PIL import Image
import os

img_path = 'monster_source.png'
img = Image.open(img_path)
width, height = img.size

cols, rows = 4, 4
cell_width = width / cols
cell_height = height / rows

count = 1
for i in range(rows):
    for j in range(cols):
        left = int(j * cell_width)
        upper = int(i * cell_height)
        right = int((j + 1) * cell_width)
        lower = int((i + 1) * cell_height)
        
        box = (left, upper, right, lower)
        cropped = img.crop(box)
        cropped.save(f'{count}.webp', 'WEBP')
        count += 1

print("Successfully generated 16 WEBP images.")
