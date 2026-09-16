"""Chroma-key the inspected companion clips into RGBA loop frames.

Input:  tools/companion-source/clips-v1/<clip>/frames/*.png + analysis.json
Output: tools/companion-source/clips-v1/<clip>/keyed/NNN.png   (RGBA, full res)
        tools/companion-source/clips-v1/<clip>/keyed-preview.png (on dark ground)
        tools/companion-source/clips-v1/<clip>/keyed.json        (range, bbox)

The background colour is estimated per frame from the border, so it works for
the green and the white takes alike. Alpha comes from the larger of an RGB
distance and a chroma (hue) distance to the background, colour is
un-premultiplied to remove spill. Nothing in art/ is touched.
"""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
CLIPS = ROOT / "tools" / "companion-source" / "clips-v1"

# Alpha ramps: below LO fully transparent, above HI fully opaque.
RGB_LO, RGB_HI = 22.0, 80.0
# Backdrop noise stays under ~6 chroma units; the darkest fur on the dark-green
# takes sits at 24+, so the chroma ramp must be fully opaque by 20.
CHROMA_LO, CHROMA_HI = 8.0, 20.0


def border_color(f):
    e = np.concatenate([f[:6].reshape(-1, 3), f[-6:].reshape(-1, 3),
                        f[:, :6].reshape(-1, 3), f[:, -6:].reshape(-1, 3)])
    return np.median(e, axis=0)


def ramp(x, lo, hi):
    return np.clip((x - lo) / (hi - lo), 0.0, 1.0)


def key_frame(rgb, bg):
    f = rgb.astype(np.float32)
    d_rgb = np.linalg.norm(f - bg, axis=2)
    # Chroma: remove luminance so shadows on the backdrop still key out.
    def chroma(v):
        lum = v.mean(axis=-1, keepdims=True)
        return v - lum
    d_chroma = np.linalg.norm(chroma(f) - chroma(bg), axis=2)
    alpha = np.maximum(ramp(d_rgb, RGB_LO, RGB_HI), ramp(d_chroma, CHROMA_LO, CHROMA_HI))
    # Un-premultiply: pixel = a*fg + (1-a)*bg  ->  fg = (pixel - (1-a)*bg) / a
    a = alpha[..., None]
    safe = np.maximum(a, 1e-3)
    fg = (f - (1 - a) * bg) / safe
    fg = np.clip(fg, 0, 255)
    if bg[1] > max(bg[0], bg[2]) + 20:
        # Despill: mixed edge pixels get alpha ~1 from the chroma ramp, so the
        # un-premultiply leaves green in them. No fox colour is green-dominant
        # (grey fur, orange scarf, amber eyes), so clamp G to max(R, B).
        cap = np.maximum(fg[..., 0], fg[..., 2])
        fg[..., 1] = np.minimum(fg[..., 1], cap)
    fg = extend_edges(fg, alpha > 0.02, radius=3)
    out = np.dstack([fg, alpha * 255]).astype(np.uint8)
    fill_holes(out, rgb)
    return out


def extend_edges(fg, known, radius=12, fill=(58, 60, 68)):
    """Colour under transparent pixels must not be backdrop green: VP9/WebP
    subsample chroma, so it would bleed into the fringe. Push fox colours
    outward a few pixels, then fall back to a neutral dark grey."""
    color = fg.copy()
    color[~known] = 0
    weight = known.astype(np.float32)
    for _ in range(radius):
        acc = np.zeros_like(color)
        cnt = np.zeros_like(weight)
        for axis, shift in ((0, 1), (0, -1), (1, 1), (1, -1)):
            acc += np.roll(color, shift, axis)
            cnt += np.roll(weight, shift, axis)
        grow = (weight == 0) & (cnt > 0)
        color[grow] = acc[grow] / cnt[grow][:, None]
        weight[grow] = 1
    color[weight == 0] = fill
    return color


def fill_holes(rgba, rgb):
    """Transparent pockets fully enclosed by the fox (eye highlights on the white
    take) are restored from the source colour: they cannot be background."""
    h, w = rgba.shape[:2]
    mask = Image.new("L", (w + 2, h + 2), 255)  # 255 = transparent candidate
    mask.paste(Image.fromarray(((rgba[..., 3] < 128) * 255).astype(np.uint8)), (1, 1))
    ImageDraw.floodfill(mask, (0, 0), 128)  # reachable background -> 128
    candidates = np.asarray(mask)[1:-1, 1:-1] == 255
    # Keep only pockets that are not just backdrop showing through a gap
    # (between scarf and body). On a coloured backdrop the pocket must differ in
    # hue; on the neutral white take hue cannot tell, so only small pockets in the
    # head band (eye highlights) are restored - scarf gaps sit lower.
    bg = border_color(rgb).astype(np.float32)
    neutral_bg = np.linalg.norm(bg - bg.mean()) < 10
    holes = np.zeros_like(candidates)
    work = mask.copy()
    while True:
        ys, xs = np.where(np.asarray(work)[1:-1, 1:-1] == 255)
        if len(ys) == 0:
            break
        ImageDraw.floodfill(work, (int(xs[0]) + 1, int(ys[0]) + 1), 64)
        comp = np.asarray(work)[1:-1, 1:-1] == 64
        ImageDraw.floodfill(work, (int(xs[0]) + 1, int(ys[0]) + 1), 32)
        col = rgb[comp].astype(np.float32).mean(axis=0)
        lum = lambda v: v - v.mean()
        area = int(comp.sum())
        if neutral_bg:
            keep = area <= 600 and np.where(comp)[0].mean() < 0.4 * h
        else:
            keep = np.linalg.norm(lum(col) - lum(bg)) > CHROMA_HI
        if keep:
            holes |= comp
    if holes.any():
        grow = holes.copy()
        for _ in range(3):  # also solidify the soft ring around each pocket
            grow |= np.roll(grow, 1, 0) | np.roll(grow, -1, 0) | np.roll(grow, 1, 1) | np.roll(grow, -1, 1)
        ring = grow & (rgba[..., 3] < 255) & ~holes
        rgba[holes | ring, :3] = rgb[holes | ring]
        rgba[holes | ring, 3] = 255


def bbox(alpha, thr=8):
    ys, xs = np.where(alpha > thr)
    if len(xs) == 0:
        return None
    return [int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1]


def preview(frames, cols=10, cell=128, ground=(30, 30, 34)):
    rows = (len(frames) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * cell, rows * (cell + 14)), (16, 16, 16))
    draw = ImageDraw.Draw(sheet)
    for i, f in enumerate(frames):
        im = Image.fromarray(f)
        im.thumbnail((cell, cell))
        tile = Image.new("RGB", im.size, ground)
        tile.paste(im, (0, 0), im)
        x, y = (i % cols) * cell, (i // cols) * (cell + 14)
        sheet.paste(tile, (x + (cell - im.width) // 2, y))
        draw.text((x + 2, y + cell), str(i), fill=(220, 220, 220))
    return sheet


def process(clip_dir, info):
    if info["best_loop"] is None:
        print(f"{clip_dir.name}: no stable range, skipped")
        return None
    _, start, end = info["best_loop"]  # frame `end` ~= frame `start`; loop is [start, end)
    files = sorted((clip_dir / "frames").glob("*.png"))[start:end]
    out_dir = clip_dir / "keyed"
    out_dir.mkdir(exist_ok=True)
    for old in out_dir.glob("*.png"):
        old.unlink()
    keyed, boxes, bgs = [], [], []
    for n, f in enumerate(files):
        rgb = np.asarray(Image.open(f).convert("RGB"))
        bg = border_color(rgb)
        rgba = key_frame(rgb, bg)
        Image.fromarray(rgba).save(out_dir / f"{n:03d}.png")
        keyed.append(rgba)
        boxes.append(bbox(rgba[..., 3]))
        bgs.append([int(v) for v in bg])
    preview(keyed).save(clip_dir / "keyed-preview.png")
    # Loop check: first keyed vs last keyed (should be near-identical, one step apart)
    union = [min(b[0] for b in boxes), min(b[1] for b in boxes),
             max(b[2] for b in boxes), max(b[3] for b in boxes)]
    meta = {"source_range": [start, end], "frames": len(files), "bbox_union": union,
            "bbox_per_frame": boxes, "bg_per_frame": bgs,
            "loop_seam_mean_diff": round(float(np.abs(keyed[0].astype(np.int16) - keyed[-1].astype(np.int16)).mean()), 2)}
    (clip_dir / "keyed.json").write_text(json.dumps(meta, indent=2), encoding="utf-8")
    print(f"{clip_dir.name:28s} frames {start}..{end-1} ({len(files)})  bbox {union}  "
          f"seam diff {meta['loop_seam_mean_diff']}  bg {bgs[0]} -> {bgs[-1]}")
    return meta


def main():
    analysis = json.loads((CLIPS / "analysis.json").read_text())
    names = [n for n in analysis if not sys.argv[1:] or any(a in n for a in sys.argv[1:])]
    for name in names:
        process(CLIPS / name, analysis[name])


if __name__ == "__main__":
    main()
