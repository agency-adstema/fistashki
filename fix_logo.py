from PIL import Image

img = Image.open('/opt/green-roots/repo/public/logo.png').convert('RGBA')
pixels = img.load()
width, height = img.size

for y in range(height):
    for x in range(width):
        r, g, b, a = pixels[x, y]
        if r + g + b < 80:
            pixels[x, y] = (r, g, b, 0)

img.save('/opt/green-roots/repo/public/logo.png')
print('Logo OK')
