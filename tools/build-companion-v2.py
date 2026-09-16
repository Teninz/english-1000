"""Build the shipping companion v2 assets into art/companion-v2/.

Sources (not shipped, see tools/build-web.js filter):
  tools/companion-source/clips-v1/<clip>/keyed/*.png   keyed fox loops (from key-companion-clips.py)
  art/Visual/Forest1.mp4                               ambient scene loop (image-to-video)
  art/companion-references/icon.png                    fox head on chroma green for the drawer handle

Outputs:
  art/companion-v2/<fox>/{idle,look,notice,blink}.webm  VP9 + alpha, 24 fps, full 530x794
  art/companion-v2/<fox>/poster.webp                     first idle frame, 360x540, for reduced motion / cards
  art/companion-v2/scene/forest.webm + forest.webp       ambient background loop and its poster
  art/companion-v2/handle.png                            192x192 transparent handle icon
  art/companion-v2/manifest.json                         frame counts and durations

  python tools/build-companion-v2.py [--crf 30] [--scene "art/Visual/Forest1.mp4"]
"""
import argparse
import importlib.util
import json
import subprocess
import sys
from pathlib import Path

import imageio.v2 as imageio
import imageio_ffmpeg
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
CLIPS = ROOT / "tools" / "companion-source" / "clips-v1"
OUT = ROOT / "art" / "companion-v2"
FPS = 24
FOXES = {
    "01-boy-calm": {"sex": "male", "states": ["idle"]},
    "02-girl-warm": {"sex": "female", "states": ["idle"]},
    "03-girl-gentle": {"sex": "female", "states": ["idle", "look", "notice", "blink"]},
    "04-boy-bold": {"sex": "male", "states": ["idle", "look", "notice", "blink"]},
}
STATE_SOURCE = {"idle": "first", "look": "look", "notice": "attention", "blink": "smile"}


def load_module(name):
    spec = importlib.util.spec_from_file_location(name, ROOT / "tools" / f"{name}.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def ffmpeg_rgb(frames, path, crf, alpha):
    w, h = frames[0].size
    pix_in = "rgba" if alpha else "rgb24"
    pix_out = "yuva420p" if alpha else "yuv420p"
    cmd = [imageio_ffmpeg.get_ffmpeg_exe(), "-hide_banner", "-loglevel", "error", "-y",
           "-f", "rawvideo", "-pix_fmt", pix_in, "-s", f"{w}x{h}", "-framerate", str(FPS), "-i", "-",
           "-vf", f"format={pix_out}", "-c:v", "libvpx-vp9", "-pix_fmt", pix_out,
           "-b:v", "0", "-crf", str(crf), "-row-mt", "1", "-an", str(path)]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for im in frames:
        proc.stdin.write(im.tobytes())
    proc.stdin.close()
    if proc.wait() != 0:
        raise SystemExit(f"ffmpeg failed: {path}")


# Pillow's own "LAB" mode is not the usual CIELAB layout, so the conversion is done here (sRGB, D65).
_M_RGB2XYZ = np.array([[0.4124564, 0.3575761, 0.1804375], [0.2126729, 0.7151522, 0.0721750], [0.0193339, 0.1191920, 0.9503041]], np.float32)
_WHITE = np.array([0.95047, 1.0, 1.08883], np.float32)


def rgb_to_lab(rgb):
    c = rgb.astype(np.float32) / 255
    lin = np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    xyz = lin @ _M_RGB2XYZ.T / _WHITE
    f = np.where(xyz > 0.008856, np.cbrt(xyz), 7.787 * xyz + 16 / 116)
    return np.stack([116 * f[..., 1] - 16, 500 * (f[..., 0] - f[..., 1]), 200 * (f[..., 1] - f[..., 2])], axis=-1)


def lab_to_rgb(lab):
    fy = (lab[..., 0] + 16) / 116
    f = np.stack([fy + lab[..., 1] / 500, fy, fy - lab[..., 2] / 200], axis=-1)
    xyz = np.where(f ** 3 > 0.008856, f ** 3, (f - 16 / 116) / 7.787) * _WHITE
    lin = xyz @ np.linalg.inv(_M_RGB2XYZ).T
    lin = np.clip(lin, 0, 1)
    c = np.where(lin <= 0.0031308, lin * 12.92, 1.055 * lin ** (1 / 2.4) - 0.055)
    return np.clip(c * 255 + 0.5, 0, 255).astype(np.uint8)


def lab_stats(im):
    """Mean L, a, b over solid fox pixels."""
    a = np.asarray(im)
    mask = a[..., 3] > 200
    return rgb_to_lab(a[..., :3][mask]).mean(axis=0)


def match_tone(frames, ref_mean, clip_mean):
    """Every clip is generated on its own backdrop and lit slightly differently,
    so its fox is shifted in CIELAB to the idle clip's mean. One shift per clip
    keeps the motion untouched; the clamp guards against a bad estimate."""
    shift = np.clip(ref_mean - clip_mean, -10, 10)
    out = []
    for im in frames:
        a = np.asarray(im)
        rgb = lab_to_rgb(rgb_to_lab(a[..., :3]) + shift)
        fixed = Image.fromarray(np.dstack([rgb, a[..., 3]]), "RGBA")
        out.append(fixed)
    return out


def build_fox(fox, spec, crf, manifest):
    folder = OUT / fox
    folder.mkdir(parents=True, exist_ok=True)
    entry = {"sex": spec["sex"], "states": {}}
    ref_stats = None
    for state in spec["states"]:
        clip = CLIPS / f"{fox}_{STATE_SOURCE[state]}" / "keyed"
        files = sorted(clip.glob("*.png"))
        if not files:
            raise SystemExit(f"no keyed frames for {fox}/{state}: run key-companion-clips.py")
        frames = [Image.open(f).convert("RGBA") for f in files]
        stats = lab_stats(frames[0])
        if state == "idle":
            ref_stats = stats
        else:
            frames = match_tone(frames, ref_stats, stats)
            entry.setdefault("toneShift", {})[state] = [round(float(v), 1) for v in (ref_stats - stats)]
        path = folder / f"{state}.webm"
        ffmpeg_rgb(frames, path, crf, alpha=True)
        entry["states"][state] = {"frames": len(frames), "ms": round(len(frames) * 1000 / FPS), "kb": round(path.stat().st_size / 1024)}
        if state == "idle":
            poster = frames[0].resize((360, 540), Image.LANCZOS)
            poster.save(folder / "poster.webp", quality=88, method=6)
        print(f"{fox}/{state}.webm {len(frames)} frames {entry['states'][state]['kb']} KB")
    manifest["foxes"][fox] = entry


def build_scene(source, crf, manifest):
    folder = OUT / "scene"
    folder.mkdir(parents=True, exist_ok=True)
    reader = imageio.get_reader(str(source), "ffmpeg")
    frames = [Image.fromarray(np.asarray(f)[..., :3]) for f in reader]
    reader.close()
    path = folder / "forest.webm"
    ffmpeg_rgb(frames, path, crf, alpha=False)
    frames[0].save(folder / "forest.webp", quality=88, method=6)
    manifest["scene"] = {"file": "forest", "frames": len(frames), "ms": round(len(frames) * 1000 / FPS),
                         "size": list(frames[0].size), "kb": round(path.stat().st_size / 1024)}
    print(f"scene/forest.webm {len(frames)} frames {frames[0].size} {manifest['scene']['kb']} KB")


def build_handle():
    key = load_module("key-companion-clips")
    rgb = np.asarray(Image.open(ROOT / "art" / "companion-references" / "icon.png").convert("RGB"))
    rgba = key.key_frame(rgb, key.border_color(rgb))
    im = Image.fromarray(rgba)
    box = im.getbbox()
    im = im.crop(box)
    side = max(im.size)
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(im, ((side - im.width) // 2, (side - im.height) // 2))
    canvas.resize((192, 192), Image.LANCZOS).save(OUT / "handle.png", optimize=True)
    print("handle.png", (OUT / "handle.png").stat().st_size // 1024, "KB")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--crf", type=int, default=30)
    ap.add_argument("--scene", default="art/Visual/Forest1.mp4")
    ap.add_argument("--only", nargs="*", default=[], help="subset: fox ids, 'scene', 'handle'")
    args = ap.parse_args()
    OUT.mkdir(parents=True, exist_ok=True)
    manifest_path = OUT / "manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8")) if manifest_path.exists() else {"fps": FPS, "foxes": {}}
    manifest["fps"] = FPS
    want = lambda key: not args.only or key in args.only
    for fox, spec in FOXES.items():
        if want(fox):
            build_fox(fox, spec, args.crf, manifest)
    if want("scene"):
        build_scene(ROOT / args.scene, args.crf, manifest)
    if want("handle"):
        build_handle()
    manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8")
    total = sum(p.stat().st_size for p in OUT.rglob("*") if p.is_file())
    print("art/companion-v2 total", round(total / 1024 / 1024, 2), "MB")


if __name__ == "__main__":
    main()
