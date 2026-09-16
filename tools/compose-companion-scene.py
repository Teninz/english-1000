"""Place a keyed fox frame onto a background plate to judge scale, light and
grounding. Writes PNG composites; nothing in art/ is modified.

  python tools/compose-companion-scene.py --bg art/Фон.png --fox tools/companion-source/clips-v1/03-girl-gentle_look/keyed/000.png \
      --height 0.42 --x 0.62 --feet 0.72 --out tools/companion-source/scene-tests/den-a.png
"""
import argparse
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent


def compose(bg, fox, height, x, feet, shadow=0.55, warm=0.12, crop=None):
    W, H = bg.size
    fh = round(H * height)
    fw = round(fox.width * fh / fox.height)
    fox = fox.resize((fw, fh), Image.LANCZOS)
    # Feet of the fox sit ~2% above the frame bottom in the keyed clips.
    fy = round(H * feet) - round(fh * 0.98)
    fx = round(W * x) - fw // 2
    out = bg.convert("RGBA")
    # Contact shadow: soft ellipse under the body.
    sh = Image.new("L", bg.size, 0)
    ImageDraw.Draw(sh).ellipse([fx + fw * 0.12, fy + fh * 0.9, fx + fw * 0.92, fy + fh * 1.02], fill=round(255 * shadow))
    sh = sh.filter(ImageFilter.GaussianBlur(fh * 0.04))
    out = Image.composite(Image.new("RGBA", bg.size, (28, 18, 10, 255)), out, sh)
    # Warm grade so the fox takes the scene light.
    if warm:
        f = np.asarray(fox).astype(np.float32)
        f[..., 0] = np.clip(f[..., 0] * (1 + warm * 0.9), 0, 255)
        f[..., 1] = np.clip(f[..., 1] * (1 + warm * 0.35), 0, 255)
        f[..., 2] = np.clip(f[..., 2] * (1 - warm * 0.6), 0, 255)
        fox = Image.fromarray(f.astype(np.uint8))
    out.alpha_composite(fox, (fx, fy))
    if crop:
        cw, ch = crop
        ch_px = H
        cw_px = round(H * cw / ch)
        cx = min(max(fx + fw // 2 - cw_px // 2, 0), W - cw_px)
        out = out.crop((cx, 0, cx + cw_px, H))
    return out.convert("RGB")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--bg", required=True)
    ap.add_argument("--fox", required=True)
    ap.add_argument("--height", type=float, default=0.42, help="fox height as a share of plate height")
    ap.add_argument("--x", type=float, default=0.6, help="fox centre, share of width")
    ap.add_argument("--feet", type=float, default=0.72, help="feet line, share of height")
    ap.add_argument("--warm", type=float, default=0.12)
    ap.add_argument("--crop", default="", help="portrait crop ratio like 2:3 around the fox")
    ap.add_argument("--out", required=True)
    a = ap.parse_args()
    crop = tuple(int(v) for v in a.crop.split(":")) if a.crop else None
    out = compose(Image.open(ROOT / a.bg), Image.open(ROOT / a.fox).convert("RGBA"), a.height, a.x, a.feet, warm=a.warm, crop=crop)
    Path(ROOT / a.out).parent.mkdir(parents=True, exist_ok=True)
    out.save(ROOT / a.out)
    print(a.out, out.size)


if __name__ == "__main__":
    main()
