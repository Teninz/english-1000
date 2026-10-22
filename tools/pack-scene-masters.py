"""Перевод мастеров сцен из PNG в lossless WebP.

Генератор изображений отдаёт PNG по 1–4 МБ на слой. Lossless WebP хранит тот же пиксель
в полтора-два раза компактнее, а в репозитории этих мастеров десятки — они и есть исходник,
из которого tools/build-scene-mips.py собирает уровни для приложения.

  python tools/pack-scene-masters.py [сцена ...]

Исходный PNG удаляется только после того, как WebP записан и сошёлся по размеру и пикселям.
"""
import sys
from pathlib import Path

from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parent.parent
SCENES = ROOT / "art" / "scenes"


def pack(png: Path):
    im = Image.open(png)
    im.load()
    out = png.with_suffix(".webp")
    im.save(out, "WEBP", lossless=True, quality=100, method=6)
    check = Image.open(out)
    check.load()
    # кодек выбрасывает альфу, если она сплошь непрозрачная: сравниваем в общем режиме
    mode = "RGBA" if "A" in im.mode and "A" in check.mode else "RGB"
    if check.size != im.size or ImageChops.difference(check.convert(mode), im.convert(mode)).getbbox() is not None:
        out.unlink(missing_ok=True)
        raise SystemExit(f"{png.name}: WebP не совпал с исходником, PNG оставлен")
    before, after = png.stat().st_size, out.stat().st_size
    png.unlink()
    return before, after


def main():
    names = sys.argv[1:] or sorted(p.name for p in SCENES.iterdir() if p.is_dir())
    total_before = total_after = 0
    for name in names:
        for png in sorted((SCENES / name).glob("*.png")):
            before, after = pack(png)
            total_before += before
            total_after += after
            print(f"{name}/{png.stem}: {before / 1048576:.2f} -> {after / 1048576:.2f} МБ")
    if total_before:
        print(f"\nвсего {total_before / 1048576:.1f} -> {total_after / 1048576:.1f} МБ")
    else:
        print("PNG-мастеров не осталось")


if __name__ == "__main__":
    main()
