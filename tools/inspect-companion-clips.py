"""Inspect generated companion clips before chroma keying.

For every MP4 in art/companion-references/01 (or --src DIR) the script writes into
tools/companion-source/clips-v1/<clip>/ (or --out DIR):

- frames/NNN.png          raw decoded frames
- contact.png             contact sheet of all frames
- loop-check.png          first frame | last frame | abs difference
- info.json               fps, size, frame count, first/last diff metrics,
                          per-frame diff to previous frame, background estimate

No files inside art/ are modified.
"""
import json
import sys
from pathlib import Path

import imageio.v2 as imageio
import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "art" / "companion-references" / "01"
OUTPUT = ROOT / "tools" / "companion-source" / "clips-v1"


def frame_diff(a, b):
    d = np.abs(a.astype(np.int16) - b.astype(np.int16))
    return float(d.mean()), float(np.percentile(d.max(axis=2), 99))


def border_color(frame):
    h, w, _ = frame.shape
    edge = np.concatenate([
        frame[:8].reshape(-1, 3), frame[-8:].reshape(-1, 3),
        frame[:, :8].reshape(-1, 3), frame[:, -8:].reshape(-1, 3)])
    return [int(v) for v in np.median(edge, axis=0)]


def contact_sheet(frames, cols=10, cell=128):
    rows = (len(frames) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * cell, rows * (cell + 14)), (24, 24, 24))
    draw = ImageDraw.Draw(sheet)
    for i, f in enumerate(frames):
        im = Image.fromarray(f)
        im.thumbnail((cell, cell))
        x, y = (i % cols) * cell, (i // cols) * (cell + 14)
        sheet.paste(im, (x + (cell - im.width) // 2, y))
        draw.text((x + 2, y + cell), str(i), fill=(220, 220, 220))
    return sheet


def loop_check(first, last, cell=384):
    diff = np.abs(first.astype(np.int16) - last.astype(np.int16)).astype(np.uint8)
    tiles = [Image.fromarray(x) for x in (first, last, diff)]
    for t in tiles:
        t.thumbnail((cell, cell))
    out = Image.new("RGB", (cell * 3, cell + 16), (24, 24, 24))
    draw = ImageDraw.Draw(out)
    for i, (t, label) in enumerate(zip(tiles, ("first", "last", "|first-last|"))):
        out.paste(t, (i * cell, 16))
        draw.text((i * cell + 4, 2), label, fill=(220, 220, 220))
    return out


def inspect(path):
    reader = imageio.get_reader(str(path), "ffmpeg")
    fps = float(reader.get_meta_data().get("fps", 0))
    frames = np.stack([np.asarray(f)[..., :3] for f in reader])
    reader.close()
    n, h, w, _ = frames.shape
    out = OUTPUT / path.stem
    (out / "frames").mkdir(parents=True, exist_ok=True)
    for i, f in enumerate(frames):
        Image.fromarray(f).save(out / "frames" / f"{i:03d}.png")
    contact_sheet(frames).save(out / "contact.png")
    loop_check(frames[0], frames[-1]).save(out / "loop-check.png")
    first_last = frame_diff(frames[0], frames[-1])
    step = [frame_diff(frames[i - 1], frames[i])[0] for i in range(1, n)]
    info = {
        "file": str(path.relative_to(ROOT)),
        "fps": fps,
        "size": [w, h],
        "frames": n,
        "duration_s": round(n / fps, 3) if fps else None,
        "border_color_rgb": border_color(frames[0]),
        "first_last_mean_diff": round(first_last[0], 2),
        "first_last_p99_diff": round(first_last[1], 1),
        "step_mean_diff": [round(v, 2) for v in step],
        "max_step_diff_at": int(np.argmax(step)) + 1 if step else None,
        "second_frame_diff": round(step[0], 2) if step else None,
    }
    (out / "info.json").write_text(json.dumps(info, indent=2), encoding="utf-8")
    return info


def main():
    global OUTPUT
    args = sys.argv[1:]
    source = SOURCE
    if "--src" in args:
        i = args.index("--src"); source = ROOT / args[i + 1]; del args[i:i + 2]
    if "--out" in args:
        i = args.index("--out"); OUTPUT = ROOT / args[i + 1]; del args[i:i + 2]
    OUTPUT.mkdir(parents=True, exist_ok=True)
    clips = sorted(source.glob("*.mp4"))
    if args:
        clips = [c for c in clips if any(a in c.name for a in args)]
    summary = []
    for clip in clips:
        info = inspect(clip)
        summary.append(info)
        print(f"{clip.stem:32s} {info['size'][0]}x{info['size'][1]} "
              f"{info['frames']:4d}f @{info['fps']:.2f}fps  "
              f"bg={info['border_color_rgb']}  "
              f"first/last diff={info['first_last_mean_diff']:.2f}  "
              f"frame1->2={info['second_frame_diff']}  "
              f"max step={max(info['step_mean_diff']):.2f}@{info['max_step_diff_at']}")
    (OUTPUT / "summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
