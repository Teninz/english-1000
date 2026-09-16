"""Pack keyed companion loops into animated WebP / APNG for review.

Usage:
  python tools/export-companion-loops.py [--height H] [--fps F] [--quality Q]
                                         [--formats webp,apng] [--out DIR] [clip filters...]

Reads tools/companion-source/clips-v1/<clip>/keyed/*.png (24 fps source),
resamples to the requested fps by dropping frames, scales to the requested
height (aspect kept) and writes <fox>/<state>.<ext> plus a preview.html into
the output folder (default tools/companion-source/clips-v1/export). Nothing in
art/ is touched.
"""
import argparse
import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
CLIPS = ROOT / "tools" / "companion-source" / "clips-v1"
SOURCE_FPS = 24
STATE_NAMES = {"first": "idle", "look": "look", "attention": "notice", "smile": "blink"}


def load_clip(clip_dir, fps, height):
    files = sorted((clip_dir / "keyed").glob("*.png"))
    step = SOURCE_FPS / fps
    picked, t = [], 0.0
    while round(t) < len(files):
        picked.append(files[round(t)])
        t += step
    frames = []
    for f in picked:
        im = Image.open(f).convert("RGBA")
        if height and im.height != height:
            im = im.resize((round(im.width * height / im.height), height), Image.LANCZOS)
        frames.append(im)
    return frames


def write_webp(frames, path, fps, quality):
    frames[0].save(path, format="WEBP", save_all=True, append_images=frames[1:],
                   duration=round(1000 / fps), loop=0, quality=quality, method=4,
                   lossless=quality >= 100, exact=False, minimize_size=True)


def write_webm(frames, path, fps, crf):
    """VP9 with alpha through the ffmpeg bundled in imageio-ffmpeg (no PATH install)."""
    import subprocess
    import imageio_ffmpeg
    w, h = frames[0].size
    cmd = [imageio_ffmpeg.get_ffmpeg_exe(), "-hide_banner", "-loglevel", "error", "-y",
           "-f", "rawvideo", "-pix_fmt", "rgba", "-s", f"{w}x{h}", "-framerate", str(fps), "-i", "-",
           "-vf", "format=yuva420p", "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p",
           "-b:v", "0", "-crf", str(crf), "-row-mt", "1", "-an", str(path)]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for im in frames:
        proc.stdin.write(im.tobytes())
    proc.stdin.close()
    if proc.wait() != 0:
        raise SystemExit(f"ffmpeg failed for {path}")


def write_apng(frames, path, fps):
    frames[0].save(path, format="PNG", save_all=True, append_images=frames[1:],
                   duration=round(1000 / fps), loop=0, optimize=True)


def preview_html(entries, out_dir):
    def tag(e):
        if e["file"].endswith(".webm"):
            return f'<video src="{e["file"]}" width="{e["width"]}" height="{e["height"]}" autoplay muted loop playsinline></video>'
        return f'<img src="{e["file"]}" width="{e["width"]}" height="{e["height"]}">'
    cards = "".join(
        f'<figure>{tag(e)}<figcaption>{e["fox"]} / {e["state"]}<br><small>{e["frames"]} к. · {e["fps"]} fps · '
        f'{e["width"]}×{e["height"]} · {e["kb"]} КБ</small></figcaption></figure>' for e in entries)
    (out_dir / "preview.html").write_text(
        "<!doctype html><meta charset=utf-8><title>Companion loops</title>"
        "<style>body{margin:0;padding:20px;background:#1a1d24;color:#ddd;font:14px system-ui}"
        ".g{display:flex;flex-wrap:wrap;gap:20px}figure{margin:0;text-align:center}"
        "img,video{max-width:265px;height:auto;background:radial-gradient(#2b3040,#1a1d24)}"
        "small{color:#9aa}</style>"
        f'<div class=g>{cards}</div>', encoding="utf-8")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--height", type=int, default=0, help="0 keeps source height (794)")
    ap.add_argument("--fps", type=int, default=24)
    ap.add_argument("--quality", type=int, default=82, help="WebP quality, 100 = lossless")
    ap.add_argument("--crf", type=int, default=30, help="VP9 quality, lower = better (24..34)")
    ap.add_argument("--formats", default="webm", help="comma list of webm,webp,apng")
    ap.add_argument("--out", default=str(CLIPS / "export"))
    ap.add_argument("filters", nargs="*")
    args = ap.parse_args()
    out_dir = Path(args.out)
    entries = []
    for clip_dir in sorted(CLIPS.iterdir()):
        if not (clip_dir / "keyed").is_dir():
            continue
        if args.filters and not any(f in clip_dir.name for f in args.filters):
            continue
        fox, state = clip_dir.name.rsplit("_", 1)
        state = STATE_NAMES.get(state, state)
        frames = load_clip(clip_dir, args.fps, args.height)
        (out_dir / fox).mkdir(parents=True, exist_ok=True)
        for fmt in args.formats.split(","):
            path = out_dir / fox / f"{state}.{'png' if fmt == 'apng' else fmt}"
            if fmt == "webp":
                write_webp(frames, path, args.fps, args.quality)
            elif fmt == "webm":
                write_webm(frames, path, args.fps, args.crf)
            elif fmt == "apng":
                write_apng(frames, path, args.fps)
            else:
                raise SystemExit(f"unknown format {fmt}")
            kb = round(path.stat().st_size / 1024)
            entries.append({"fox": fox, "state": state, "file": f"{fox}/{path.name}", "frames": len(frames),
                            "fps": args.fps, "width": frames[0].width, "height": frames[0].height, "kb": kb})
            print(f"{fox}/{path.name:12s} {len(frames):3d} frames  {frames[0].width}x{frames[0].height}  {kb:6d} KB")
    preview_html(entries, out_dir)
    (out_dir / "manifest.json").write_text(json.dumps(entries, indent=2, ensure_ascii=False), encoding="utf-8")
    print("total", sum(e["kb"] for e in entries), "KB ->", out_dir)


if __name__ == "__main__":
    main()
