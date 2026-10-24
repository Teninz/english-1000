"""Слои мерцающего света для ночных сцен.

В ночных мастерах уже нарисованы тёплые окна, фонари и отражения. Чтобы свет «дышал»,
не перерисовывая сцену, он вытаскивается из среднего плана маской и кладётся отдельным
слоем поверх — приложение потом меняет его прозрачность.

Огни разводятся по двум группам, иначе целый город мигал бы в такт. Группы считаются по
связным пятнам: окно целиком попадает в одну группу и не мерцает половинками.

  python tools/build-scene-glow.py [сцена ...]

Пишет art/scenes/<сцена>/night-glowa.webp и night-glowb.webp там, где света достаточно.
Уровни для приложения из них делает tools/build-scene-mips.py.
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SCENES = ROOT / "art" / "scenes"
MIN_PIXELS = 2000  # меньше — свету нечем мерцать, слой не нужен


def warm_mask(rgba):
    r, g, b, a = (rgba[..., i].astype(int) for i in range(4))
    lum = 0.299 * r + 0.587 * g + 0.114 * b
    hot = (a > 200) & (lum > 140) & (r > b + 35)
    # мягкая маска: у края пятна свет слабее, чем в середине
    weight = np.clip((lum - 140) / 80, 0, 1) * hot
    return hot, weight


def label(mask):
    """Связные пятна без scipy: метка растекается максимумом по четырём соседям."""
    lab = np.where(mask, np.arange(mask.size).reshape(mask.shape) + 1, 0)
    while True:
        nxt = lab.copy()
        for axis, shift in ((0, 1), (0, -1), (1, 1), (1, -1)):
            np.maximum(nxt, np.roll(lab, shift, axis=axis) * mask, out=nxt)
        if np.array_equal(nxt, lab):
            return lab
        lab = nxt


def build(scene: Path):
    master = scene / "night-mid.webp"
    if not master.exists():
        return print(f"{scene.name}: нет night-mid, пропуск")
    rgba = np.asarray(Image.open(master).convert("RGBA"))
    hot, weight = warm_mask(rgba)
    if hot.sum() < MIN_PIXELS:
        return print(f"{scene.name}: тёплого света мало ({hot.sum()} px), слои не нужны")

    lab = label(hot)
    ids = np.unique(lab[lab > 0])
    # группа по номеру пятна: соседние окна почти всегда расходятся по разным группам
    group = {v: i % 2 for i, v in enumerate(ids)}
    picked = np.vectorize(lambda v: group.get(v, -1), otypes=[int])(lab)

    for i, suffix in enumerate("ab"):
        core = (weight * (picked == i)).astype(np.float32)
        if core.max() == 0:
            continue
        # Светится не само окно, а отсвет на стене вокруг: окно в мастере и так почти белое,
        # ярче его не сделать. Поэтому берём размытый ореол и вычитаем из него сердцевину.
        spread = Image.fromarray((core * 255).astype(np.uint8), "L")
        spread = spread.filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.GaussianBlur(14))
        halo = np.clip(np.asarray(spread).astype(np.float32) / 255 - core, 0, 1)
        img = np.zeros(rgba.shape, np.uint8)
        img[..., 0], img[..., 1], img[..., 2] = 255, 186, 112  # тёплый янтарь ламп
        img[..., 3] = (np.clip(halo * 1.6, 0, 1) * 255).astype(np.uint8)
        path = scene / f"night-glow{suffix}.webp"
        Image.fromarray(img, "RGBA").save(path, "WEBP", lossless=True, quality=100, method=6)
        print(f"{scene.name}/night-glow{suffix}: {len(ids)//2} пятен, ореол {halo.max():.2f}, {path.stat().st_size/1048576:.2f} МБ")


def main():
    names = sys.argv[1:] or sorted(p.name for p in SCENES.iterdir() if p.is_dir())
    for name in names:
        build(SCENES / name)


if __name__ == "__main__":
    main()
