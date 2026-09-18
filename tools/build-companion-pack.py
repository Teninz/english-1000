"""Собирает набор лисы v2 (клипы 17.09) и суточный цикл сцены в art/companion-v2/.

Источники (в APK не попадают):
  tools/companion-source/clips-v2/<clip>/frames/*.png   кадры клипов 04 (inspect-companion-clips.py --src ... --out ...)
  tools/companion-source/scene-v2/src/*.mp4              петли и переходы фона по времени суток
  art/companion-references/03/03-girl-gentle_greenscreen.png   постер запертой лисы 03

Результат:
  art/companion-v2/04-boy-bold/<clip>.webm      VP9 + альфа, 24 fps, 768x768 (общий padded-кадр)
  art/companion-v2/04-boy-bold/poster.webp      покой; poster-sad/-offended/-sleep.webp — грусть, обида, сон
  art/companion-v2/03-girl-gentle/poster.webp   только постер (лиса заперта)
  art/companion-v2/scene/<period>-<n>.webm, <period>.webp, <from>-<to>.webm
  art/companion-v2/manifest.json + manifest.js  описание набора для плеера

Все клипы 04 начинаются и заканчиваются одним каноническим кадром покоя
(кадр 0 clip calm1) либо каноническим кадром сна (кадр 6 clip sleep): к
краям клипа подшиваются короткие растворения, поэтому переключение между
любыми клипами бесшовно.

  python tools/build-companion-pack.py [--crf 30] [--only fox|scene|posters|manifest]
"""
import argparse
import importlib.util
import json
from pathlib import Path

import imageio.v2 as imageio
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
CLIPS = ROOT / "tools" / "companion-source" / "clips-v2"
SCENE_SRC = ROOT / "tools" / "companion-source" / "scene-v2" / "src"
OUT = ROOT / "art" / "companion-v2"
FPS = 24
FOX = "04-boy-bold"
PACK_VERSION = 3  # поднимать при любом изменении состава клипов: приложение скачивает релиз fox-pack-<версия>

# range — [от, до) исходных кадров; from/to — какой канонический кадр подшить к началу/концу.
# kind: loop — крутится сама; oneshot — от покоя к покою, играется целиком; transition — меняет состояние.
# framing: "padded" — клип сгенерирован по референсам image/padded (лиса ~72 % кадра, есть запас под уши и хвост);
#          "orig" — по исходным референсам (лиса ~90 % кадра): такие кадры уменьшаются на PAD_SCALE к центру,
#          что в точности повторяет построение padded-референсов, и попадают в тот же кадр.
FOX_CLIPS = {
    # спокойное состояние (0 пропущенных дней)
    "calm1":         {"src": "04-boy-bold_calm1",         "range": [1, 124],  "kind": "oneshot",    "from": "rest",     "to": "rest",     "framing": "padded"},
    "calm2":         {"src": "04-boy-bold_calm2",         "range": [1, 121],  "kind": "oneshot",    "from": "rest",     "to": "rest",     "framing": "orig"},
    "calm3":         {"src": "04-boy-bold_calm3",         "range": [1, 124],  "kind": "oneshot",    "from": "rest",     "to": "rest",     "framing": "padded"},
    "calm4":         {"src": "04-boy-bold_calm4",         "range": [1, 124],  "kind": "oneshot",    "from": "rest",     "to": "rest",     "framing": "padded"},
    "calm5":         {"src": "04-boy-bold_calm5",         "range": [1, 121],  "kind": "oneshot",    "from": "rest",     "to": "rest",     "framing": "padded", "blend_out": 10},
    "touch":         {"src": "04-boy-bold_touch",         "range": [1, 124],  "kind": "oneshot",    "from": "rest",     "to": "rest",     "framing": "padded"},
    # грусть (1–2 дня без занятий)
    "sad-idle":      {"src": "04-boy-bold_sad-idle",      "range": [9, 121],  "kind": "loop",       "from": None,       "to": None,       "framing": "orig"},
    "sad1":          {"src": "04-boy-bold_sad1",          "range": [1, 121],  "kind": "oneshot",    "from": "sad",      "to": "sad",      "framing": "orig"},
    "sad2":          {"src": "04-boy-bold_sad2",          "range": [1, 121],  "kind": "oneshot",    "from": "sad",      "to": "sad",      "framing": "orig"},
    # обида (3 дня и больше)
    "offended-idle": {"src": "04-boy-bold_offended-idle", "range": [0, 121],  "kind": "loop",       "from": None,       "to": None,       "framing": "orig"},
    "offended1":     {"src": "04-boy-bold_offended1",     "range": [1, 121],  "kind": "oneshot",    "from": "offended", "to": "offended", "framing": "orig"},
    # сон
    "lie-down":      {"src": "04-boy-bold_lie-down",      "range": [1, 121],  "kind": "transition", "from": "rest",     "to": None,       "framing": "padded"},
    "fall-asleep":   {"src": "04-boy-bold_fall-asleep",   "range": [0, 121],  "kind": "transition", "from": None,       "to": "sleep",    "framing": "orig"},
    "sleep":         {"src": "04-boy-bold_sleep",         "range": [6, 103],  "kind": "loop",       "from": None,       "to": None,       "framing": "orig"},
    "sleep-touch":   {"src": "04-boy-bold_sleep-touch",   "range": [1, 121],  "kind": "oneshot",    "from": "sleep",    "to": "sleep",    "framing": "orig"},
    "wake-up":       {"src": "04-boy-bold_wake-up",       "range": [0, 241],  "kind": "transition", "from": "sleep",    "to": "rest",     "framing": "padded"},
}
# Канонические кадры: покой, грусть, обида, сон. Клипы одного набора начинаются и заканчиваются своим кадром.
ANCHORS = {
    "rest":     ("04-boy-bold_calm1", 0, "padded"),
    "sad":      ("04-boy-bold_sad-idle", 9, "orig"),
    "offended": ("04-boy-bold_offended-idle", 0, "orig"),
    "sleep":    ("04-boy-bold_sleep", 6, "orig"),
}
# Наборы по настроению: петля покоя, «сюжетные» вставки и реакция на касание.
SETS = {
    "calm":     {"idle": None,            "active": ["calm1", "calm2", "calm3", "calm4", "calm5"], "touch": "touch"},  # петля покоя отложена: у дубля мерцал фон
    "sad":      {"idle": "sad-idle",      "active": ["sad1", "sad2"],                              "touch": None},
    "offended": {"idle": "offended-idle", "active": ["offended1"],                                 "touch": None},
}
BLEND_IN, BLEND_OUT = 4, 6        # кадров растворения в начале и в конце
CANVAS = 768                      # общий холст (разрешение новых клипов)
PAD_SCALE = 0.72                  # см. art/companion-references/04/image/padded

PERIODS = ["morning", "day", "evening", "night"]
TRANSITIONS = ["morning-day", "day-evening", "evening-night", "night-morning"]


def load_module(name):
    spec = importlib.util.spec_from_file_location(name, ROOT / "tools" / f"{name}.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


KEY = load_module("key-companion-clips")
V2 = load_module("build-companion-v2")


def keyed(clip, index, framing="padded"):
    rgb = np.asarray(Image.open(CLIPS / clip / "frames" / f"{index:03d}.png").convert("RGB"))
    im = Image.fromarray(KEY.key_frame(rgb, KEY.border_color(rgb)))
    return to_canvas(im, framing)


def to_canvas(im, framing):
    """Приводит кадр к общему холсту CANVAS×CANVAS в padded-кадрировании."""
    scale = (PAD_SCALE if framing == "orig" else 1.0) * CANVAS / im.width
    size = max(1, round(im.width * scale))
    small = im.resize((size, size), Image.LANCZOS) if size != im.width else im
    if size == CANVAS:
        return small
    canvas = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
    canvas.paste(small, ((CANVAS - size) // 2, (CANVAS - size) // 2))
    return canvas


def blend(a, b, count):
    """count промежуточных кадров между RGBA-кадрами a и b (оба исключаются)."""
    fa, fb = np.asarray(a).astype(np.float32), np.asarray(b).astype(np.float32)
    return [Image.fromarray(np.clip(fa + (fb - fa) * (i / (count + 1)), 0, 255).astype(np.uint8)) for i in range(1, count + 1)]


def build_fox(crf, manifest):
    folder = OUT / FOX
    folder.mkdir(parents=True, exist_ok=True)
    for old in folder.glob("*.webm"):  # клипы прежнего набора (idle/look/notice/blink) больше не нужны
        if old.stem not in FOX_CLIPS:
            old.unlink()
    anchors = {name: keyed(*src) for name, src in ANCHORS.items()}
    entry = {"sex": "male", "size": list(anchors["rest"].size), "clips": {}, "sets": SETS}
    for name, spec in FOX_CLIPS.items():
        body = [keyed(spec["src"], i, spec["framing"]) for i in range(*spec["range"])]
        frames = []
        if spec["from"]:
            frames += [anchors[spec["from"]]] + blend(anchors[spec["from"]], body[0], BLEND_IN)
        frames += body
        if spec["to"]:
            frames += blend(body[-1], anchors[spec["to"]], spec.get("blend_out", BLEND_OUT)) + [anchors[spec["to"]]]
        path = folder / f"{name}.webm"
        V2.ffmpeg_rgb(frames, path, crf, alpha=True)
        entry["clips"][name] = {"kind": spec["kind"], "frames": len(frames), "ms": round(len(frames) * 1000 / FPS),
                                "kb": round(path.stat().st_size / 1024), "framing": spec["framing"]}
        print(f"{FOX}/{name}.webm {len(frames)} frames {entry['clips'][name]['kb']} KB")
    for name, im in anchors.items():
        im.resize((360, 360), Image.LANCZOS).save(folder / ("poster.webp" if name == "rest" else f"poster-{name}.webp"), quality=88, method=6)
    manifest["foxes"][FOX] = entry


def build_posters(manifest):
    """Запертые лисы: только постер, клипов нет."""
    rgb = np.asarray(Image.open(ROOT / "art" / "companion-references" / "03" / "03-girl-gentle_greenscreen.png").convert("RGB"))
    im = Image.fromarray(KEY.key_frame(rgb, KEY.border_color(rgb))).resize((360, 360), Image.LANCZOS)
    folder = OUT / "03-girl-gentle"
    folder.mkdir(parents=True, exist_ok=True)
    for old in folder.glob("*.webm"):
        old.unlink()
    im.save(folder / "poster.webp", quality=88, method=6)
    manifest["foxes"]["03-girl-gentle"] = {"sex": "female", "clips": {}}
    for fox, sex in (("01-boy-calm", "male"), ("02-girl-warm", "female")):
        for old in (OUT / fox).glob("*.webm"):
            old.unlink()
        manifest["foxes"][fox] = {"sex": sex, "clips": {}}
    print("posters: 03 rebuilt, 01/02 clips removed")


def read_video(path):
    reader = imageio.get_reader(str(path), "ffmpeg")
    frames = [Image.fromarray(np.asarray(f)[..., :3]) for f in reader]
    reader.close()
    return frames


def build_scene(crf, manifest):
    folder = OUT / "scene"
    folder.mkdir(parents=True, exist_ok=True)
    for old in folder.glob("forest.*"):
        old.unlink()
    scene = {"periods": {}, "transitions": {}}
    for period in PERIODS:
        loops = []
        for n in (1, 2):
            src = SCENE_SRC / f"{period}-{n}.mp4"
            if not src.exists():
                continue
            frames = read_video(src)
            path = folder / f"{period}-{n}.webm"
            V2.ffmpeg_rgb(frames, path, crf, alpha=False)
            loops.append({"file": f"{period}-{n}", "frames": len(frames), "ms": round(len(frames) * 1000 / FPS),
                          "size": list(frames[0].size), "kb": round(path.stat().st_size / 1024)})
            if n == 1:
                frames[0].save(folder / f"{period}.webp", quality=86, method=6)
            print(f"scene/{period}-{n}.webm {len(frames)} frames {frames[0].size} {loops[-1]['kb']} KB")
        scene["periods"][period] = loops
    for name in TRANSITIONS:
        src = SCENE_SRC / f"{name}.mp4"
        if not src.exists():
            continue
        frames = read_video(src)
        path = folder / f"{name}.webm"
        V2.ffmpeg_rgb(frames, path, crf, alpha=False)
        scene["transitions"][name] = {"frames": len(frames), "ms": round(len(frames) * 1000 / FPS), "kb": round(path.stat().st_size / 1024)}
        print(f"scene/{name}.webm {len(frames)} frames {scene['transitions'][name]['kb']} KB")
    manifest["scene"] = scene


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--crf", type=int, default=30)
    ap.add_argument("--only", nargs="*", default=[])
    args = ap.parse_args()
    OUT.mkdir(parents=True, exist_ok=True)
    path = OUT / "manifest.json"
    manifest = json.loads(path.read_text(encoding="utf-8")) if path.exists() else {}
    manifest = {"fps": FPS, "version": PACK_VERSION, "foxes": manifest.get("foxes", {}), "scene": manifest.get("scene", {})}
    want = lambda key: not args.only or key in args.only
    if want("fox"):
        build_fox(args.crf, manifest)
    if want("posters"):
        build_posters(manifest)
    if want("scene"):
        build_scene(args.crf, manifest)
    for fox in list(manifest["foxes"]):
        manifest["foxes"][fox].pop("states", None)
        manifest["foxes"][fox].pop("toneShift", None)
    text = json.dumps(manifest, indent=2, ensure_ascii=False)
    path.write_text(text, encoding="utf-8")
    (OUT / "manifest.js").write_text("// Генерируется tools/build-companion-pack.py — не править вручную.\nconst FOX_PACK = " + text + ";\n", encoding="utf-8")
    total = sum(p.stat().st_size for p in OUT.rglob("*") if p.is_file())
    print("art/companion-v2 total", round(total / 1024 / 1024, 2), "MB")


if __name__ == "__main__":
    main()
