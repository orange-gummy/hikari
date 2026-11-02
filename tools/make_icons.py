# ホーム画面のアイコンを描くツール（案2「7色の星座」）
# 使い方: python tools/make_icons.py   （Pillow が必要。icons/ に PNG を書き出す）
import os
from PIL import Image, ImageDraw, ImageFilter

BG = (4, 5, 12)
COLORS = [(255, 150, 72), (90, 225, 160), (245, 120, 200), (255, 220, 110), (100, 155, 255), (246, 247, 252), (165, 168, 178)]
CONS_PTS = [(8, 34), (26, 14), (46, 26), (64, 6), (84, 22), (104, 10), (122, 36)]  # ui/hud.js の星座と同じ形
STARS = [(0.18, 0.22, 0.30), (0.80, 0.17, 0.25), (0.62, 0.30, 0.18), (0.27, 0.78, 0.22), (0.74, 0.80, 0.30), (0.50, 0.70, 0.16), (0.12, 0.52, 0.18), (0.90, 0.55, 0.20)]
SS = 4  # 縁をなめらかにするため、大きく描いて縮める
OUT = os.path.join(os.path.dirname(__file__), '..', 'icons')


def draw(size, scale, rounded):
    N = size * SS
    img = Image.new('RGBA', (N, N), BG + (255,))
    k = N / 512 * scale
    pts = [(N / 2 + ((x - 65) * 3.3) * k, N / 2 + ((y - 21) * 3.3) * k) for x, y in CONS_PTS]

    stars = Image.new('RGBA', (N, N), (0, 0, 0, 0))
    d = ImageDraw.Draw(stars)
    for sx, sy, a in STARS:
        r = 1.6 * N / 512
        d.ellipse((sx * N - r, sy * N - r, sx * N + r, sy * N + r), fill=(246, 247, 252, int(255 * a)))
    img.alpha_composite(stars)

    glow = Image.new('RGBA', (N, N), (0, 0, 0, 0))
    d = ImageDraw.Draw(glow)
    for (x, y), c in zip(pts, COLORS):
        r = 26 * k
        d.ellipse((x - r, y - r, x + r, y + r), fill=c + (110,))
    img.alpha_composite(glow.filter(ImageFilter.GaussianBlur(18 * k)))

    lines = Image.new('RGBA', (N, N), (0, 0, 0, 0))
    ImageDraw.Draw(lines).line(pts, fill=(246, 247, 252, 115), width=max(1, round(3 * k)), joint='curve')
    img.alpha_composite(lines)

    dots = Image.new('RGBA', (N, N), (0, 0, 0, 0))
    d = ImageDraw.Draw(dots)
    for (x, y), c in zip(pts, COLORS):
        r = 12 * k
        d.ellipse((x - r, y - r, x + r, y + r), fill=c + (255,))
    img.alpha_composite(dots)

    if rounded:
        mask = Image.new('L', (N, N), 0)
        ImageDraw.Draw(mask).rounded_rectangle((0, 0, N - 1, N - 1), radius=N * 0.22, fill=255)
        img.putalpha(mask)
    return img.resize((size, size), Image.LANCZOS)


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    for name, size, scale, rounded in [
        ('icon-192.png', 192, 1.0, True),
        ('icon-512.png', 512, 1.0, True),
        ('maskable-512.png', 512, 0.78, False),   # 端が切り取られても星座が残るよう小さめに
        ('apple-touch-icon.png', 180, 0.9, False),  # iOS は自分で角を丸める
        ('favicon-32.png', 32, 1.25, True),
    ]:
        draw(size, scale, rounded).save(os.path.join(OUT, name), optimize=True)
        print(name)
