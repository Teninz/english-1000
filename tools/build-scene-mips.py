"""Мип-уровни и WebP для растровых сцен-задников.

Мастера лежат в art/scenes/<сцена>/<вариант>-<слой>.webp (2048×1280, lossless, с альфой у mid и near).
Генератор отдаёт PNG, он тоже читается; tools/pack-scene-masters.py переводит их в lossless WebP,
который вдвое легче при том же качестве.
Скрипт считает из каждого мастера уровни уменьшения правильным фильтром (Lanczos) и кодирует их
в WebP. Браузер выбирает уровень через image-set() по плотности экрана: это веб-эквивалент
мипмаппинга — нет мерцания деталей при масштабировании и не грузится лишнее на узком экране.

Ширины уровней подобраны под телефон с запасом на параллакс (слои ездят до 7 % ширины):
  768  — DPR 1 (экран 360–430 px)
  1152 — DPR 2 и выше

Уровня 1536 нет намеренно: задник всегда идёт под размытием 2.2px, лишняя плотность в него
не доезжает, а вес растёт в полтора раза. Альфа кодируется грубее цвета (alpha_quality 60):
у листвы 42 % пикселей — полупрозрачные края, это две трети веса файла, а ступеньки на них
съедает то же размытие.

  python tools/build-scene-mips.py [сцена ...] [--quality 82]

Без аргументов обрабатываются все сцены из art/scenes/. Мастера остаются нетронутыми;
в репозиторий для приложения идут только WebP (см. tools/build-web.js).
"""
import argparse
import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SCENES = ROOT / "art" / "scenes"
LAYERS = ["sky", "mid", "near", "glowa", "glowb"]
# слои мерцающего света есть не у всех сцен: tools/build-scene-glow.py делает их там,
# где в кадре достаточно тёплых окон и фонарей
OPTIONAL = ("glowa", "glowb")
VARIANTS = ["night", "day"]
WIDTHS = [768, 1152]
MASTER = (2048, 1280)


def find_master(folder: Path, name: str):
    for ext in (".webp", ".png"):
        candidate = folder / (name + ext)
        if candidate.exists():
            return candidate
    return None


def build_layer(master: Path, quality: int):
    im = Image.open(master)
    if im.size != MASTER:
        raise SystemExit(f"{master.name}: ожидался мастер {MASTER[0]}×{MASTER[1]}, получено {im.size[0]}×{im.size[1]}")
    opaque = master.stem.endswith("sky")
    im = im.convert("RGB" if opaque else "RGBA")
    out = []
    for width in WIDTHS:
        height = round(width * MASTER[1] / MASTER[0])
        level = im.resize((width, height), Image.LANCZOS)
        path = master.with_name(f"{master.stem}-{width}.webp")
        # alpha_quality ниже у слоёв с прозрачностью: контур всё равно уходит в размытие фона
        level.save(path, "WEBP", quality=quality, method=6, alpha_quality=60 if not opaque else 100)
        out.append({"w": width, "h": height, "kb": round(path.stat().st_size / 1024, 1), "file": path.name})
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("scenes", nargs="*", help="имена папок в art/scenes (по умолчанию все)")
    ap.add_argument("--quality", type=int, default=74)
    args = ap.parse_args()
    names = args.scenes or sorted(p.name for p in SCENES.iterdir() if p.is_dir())
    report = {}
    for name in names:
        folder = SCENES / name
        scene = {}
        for variant in VARIANTS:
            for layer in LAYERS:
                master = find_master(folder, f"{variant}-{layer}")
                if master is None:
                    if layer not in OPTIONAL:
                        print(f"{name}: пропущен {variant}-{layer} — мастера нет")
                    continue
                scene[f"{variant}-{layer}"] = build_layer(master, args.quality)
                total = sum(x["kb"] for x in scene[f"{variant}-{layer}"])
                print(f"{name}/{variant}-{layer}: уровни {[x['w'] for x in scene[f'{variant}-{layer}']]}, всего {total:.0f} КБ")
        report[name] = scene
        weight = sum(x["kb"] for layer in scene.values() for x in layer)
        print(f"{name}: {weight / 1024:.2f} МБ в WebP\n")
    (SCENES / "mips.json").write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")


if __name__ == "__main__":
    main()
