import os
from rembg import remove
from PIL import Image

for i in range(1, 17):
    filename = f"{i}.webp"
    if os.path.exists(filename):
        print(f"Processing {filename}...")
        input_image = Image.open(filename)
        output_image = remove(input_image)
        output_image.save(filename, 'WEBP')

print("All backgrounds removed!")
