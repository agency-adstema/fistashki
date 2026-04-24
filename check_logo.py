from PIL import Image
img = Image.open('/opt/green-roots/repo/public/logo-kb.png')
print('Mode:', img.mode)
print('Size:', img.size)
if img.mode == 'RGBA':
    px = list(img.getdata())
    transparent = sum(1 for p in px if p[3] == 0)
    black_opaque = sum(1 for p in px if p[0] < 30 and p[1] < 30 and p[2] < 30 and p[3] > 200)
    total = len(px)
    print('Transparent pixels:', transparent, '/', total)
    print('Black opaque pixels:', black_opaque)
else:
    print('NEMA ALPHA KANALA - nije transparent PNG!')
    print('Konvertujem u RGBA i uklanjam crne piksele...')
    img = img.convert('RGBA')
    px = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if r + g + b < 80:
                px[x, y] = (r, g, b, 0)
    img.save('/opt/green-roots/repo/public/logo-kb.png')
    print('Sacuvano kao RGBA transparent PNG')
