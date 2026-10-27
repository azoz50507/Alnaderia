"""Generate the website's responsive WebP images from the PNG masters. Needs Pillow.

Run after replacing a master image:  python scripts/make_images.py
Then rebuild the pages:              python scripts/build_site.py
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
MASTERS = ROOT / '_source'
ASSETS = ROOT / 'assets'

# Scene images used whole (hero, story, nursery): one WebP per width, the largest keeps the plain name.
SCENES = {'fig-harvest': (640, 1024, 1536), 'fig-pantry': (640, 1024, 1536), 'fig-nursery': (480, 768, 1024)}

# Product cards show a 4:3 frame. Each crop is the frame a card would show after object-fit: cover at
# (x%, y%) and a zoom around that same point, cut once here so phones never download the full master.
PRODUCTS = {
    'fresh': ('fig-harvest', 0.58, 0.55, 1.0),
    'dried': ('fig-pantry', 0.30, 0.46, 1.7),
    'paste': ('fig-pantry', 0.76, 0.62, 1.9),
    'seedling': ('fig-nursery', 0.50, 0.58, 1.0),
    'cuttings': ('fig-nursery', 0.50, 0.60, 1.8),
    'gift': ('fig-harvest', 0.88, 0.80, 2.0),
}
PRODUCT_WIDTHS = (480, 800, 1200)


def save(image, path, width):
    height = round(image.height * width / image.width)
    image.resize((width, height), Image.LANCZOS).save(path, 'WEBP', quality=80, method=6)
    print(f'{path.relative_to(ROOT)}  {width}x{height}  {path.stat().st_size // 1024} KB')


def product_crop(master, x, y, zoom):
    width, height = master.size
    if width / height > 4 / 3:
        cover_w, cover_h = height * 4 / 3, height
    else:
        cover_w, cover_h = width, width * 3 / 4
    left = (width - cover_w) * x + x * cover_w * (1 - 1 / zoom)
    top = (height - cover_h) * y + y * cover_h * (1 - 1 / zoom)
    return master.crop((round(left), round(top), round(left + cover_w / zoom), round(top + cover_h / zoom)))


def main():
    masters = {name: Image.open(MASTERS / f'{name}.png').convert('RGB') for name in SCENES}
    for name, widths in SCENES.items():
        for width in widths:
            suffix = '' if width == widths[-1] else f'-{width}'
            save(masters[name], ASSETS / f'{name}{suffix}.webp', width)
    (ASSETS / 'products').mkdir(exist_ok=True)
    for product, (name, x, y, zoom) in PRODUCTS.items():
        crop = product_crop(masters[name], x, y, zoom)
        # Skip a step that would be within 10% of the crop's own width; the crop itself is the largest file.
        widths = [w for w in PRODUCT_WIDTHS if w <= crop.width * 0.9] + [min(crop.width, PRODUCT_WIDTHS[-1])]
        for width in sorted(set(widths)):
            save(crop, ASSETS / 'products' / f'{product}-{width}.webp', width)


if __name__ == '__main__':
    main()
