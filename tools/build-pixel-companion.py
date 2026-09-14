"""Build compact 128 px pixel-fox poses and 12 fps animation frames.

The source atlas is intentionally stored under tools/ so it is never copied into
the APK.  Pillow is only a development dependency; the generated PNG/APNG files
are committed and the ordinary Android build does not execute this script.
"""

from __future__ import annotations

from collections import deque
from pathlib import Path
import math
import shutil

from PIL import Image


ROOT = Path(__file__).resolve().parent.parent
ATLAS = ROOT / "tools" / "companion-source" / "pixel-fox-atlas.png"
STATIC_DIR = ROOT / "art" / "companion"
FRAME_DIR = ROOT / "art" / "companion-anim-frames"
SIZE = 128
FPS = 12
TRANSPARENT_RGB = (255, 0, 255)

POSES = [
    "idle", "listen", "happy", "pet",
    "feed", "drink", "hungry", "thirsty",
    "stretch", "yawn", "sleep", "lesson",
    "quiet", "sad", "offended", "withdrawn",
]

# Animation duration is deliberately integral in seconds.  Every timeline is
# encoded at 12 fps; motion values are held for two frames for the stepped look.
DURATIONS = {
    "idle": 5, "listen": 3, "pet": 3, "feed": 4,
    "happy": 3, "quiet": 5, "sad": 5, "withdrawn": 7,
    "stretch": 4, "drink": 4, "yawn": 4, "sleep": 7,
    "hungry": 5, "thirsty": 5, "offended": 5, "lesson": 4,
}


def remove_checkerboard(source: Image.Image) -> Image.Image:
    """Remove the connected neutral checkerboard without erasing white eyes."""
    rgb = source.convert("RGB")
    width, height = rgb.size
    pixels = rgb.load()

    def background_like(x: int, y: int) -> bool:
        r, g, b = pixels[x, y]
        return min(r, g, b) >= 178 and max(r, g, b) - min(r, g, b) <= 30

    seen = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()
    for x in range(width):
        if background_like(x, 0): queue.append((x, 0))
        if background_like(x, height - 1): queue.append((x, height - 1))
    for y in range(height):
        if background_like(0, y): queue.append((0, y))
        if background_like(width - 1, y): queue.append((width - 1, y))

    while queue:
        x, y = queue.popleft()
        index = y * width + x
        if seen[index] or not background_like(x, y):
            continue
        seen[index] = 1
        if x: queue.append((x - 1, y))
        if x + 1 < width: queue.append((x + 1, y))
        if y: queue.append((x, y - 1))
        if y + 1 < height: queue.append((x, y + 1))

    alpha = Image.new("L", rgb.size, 255)
    alpha.putdata([0 if value else 255 for value in seen])
    rgba = rgb.convert("RGBA")
    rgba.putalpha(alpha)
    return rgba


def atlas_poses(atlas: Image.Image) -> dict[str, Image.Image]:
    poses: dict[str, Image.Image] = {}
    width, height = atlas.size
    for index, name in enumerate(POSES):
        row, column = divmod(index, 4)
        box = (
            round(column * width / 4), round(row * height / 4),
            round((column + 1) * width / 4), round((row + 1) * height / 4),
        )
        cell = atlas.crop(box).resize((SIZE, SIZE), Image.Resampling.NEAREST)
        # Pixel-art output uses hard alpha; tiny edge remnants become transparent.
        a = cell.getchannel("A").point(lambda value: 255 if value >= 128 else 0)
        cell.putalpha(a)
        remove_specks(cell)
        poses[name] = cell
    return poses


def remove_specks(image: Image.Image, minimum: int = 12) -> None:
    """Drop tiny disconnected remnants that crossed an atlas cell boundary."""
    alpha = image.getchannel("A")
    pixels = alpha.load()
    seen: set[tuple[int, int]] = set()
    for y in range(SIZE):
        for x in range(SIZE):
            if pixels[x, y] == 0 or (x, y) in seen:
                continue
            queue = deque([(x, y)])
            component: list[tuple[int, int]] = []
            seen.add((x, y))
            while queue:
                px, py = queue.popleft()
                component.append((px, py))
                for nx, ny in ((px - 1, py), (px + 1, py), (px, py - 1), (px, py + 1)):
                    if 0 <= nx < SIZE and 0 <= ny < SIZE and pixels[nx, ny] and (nx, ny) not in seen:
                        seen.add((nx, ny))
                        queue.append((nx, ny))
            xs = [point[0] for point in component]
            ys = [point[1] for point in component]
            touches_cut = min(xs) <= 3 or max(xs) >= SIZE - 4 or min(ys) <= 3 or max(ys) >= SIZE - 4
            if len(component) < minimum or (touches_cut and len(component) < 100):
                for px, py in component:
                    pixels[px, py] = 0
    image.putalpha(alpha)


def transformed(image: Image.Image, dx: int, dy: int, angle: float, sx: float, sy: float) -> Image.Image:
    bbox = image.getbbox()
    if not bbox:
        return image.copy()
    sprite = image.crop(bbox)
    new_size = (max(1, round(sprite.width * sx)), max(1, round(sprite.height * sy)))
    sprite = sprite.resize(new_size, Image.Resampling.NEAREST)
    if angle:
        sprite = sprite.rotate(angle, resample=Image.Resampling.NEAREST, expand=True)
    canvas = Image.new("RGBA", (SIZE, SIZE))
    original_bottom = SIZE - bbox[3]
    x = round((SIZE - sprite.width) / 2 + dx)
    y = round(SIZE - original_bottom - sprite.height + dy)
    canvas.alpha_composite(sprite, (x, y))
    return canvas


def motion(name: str, frame: int, count: int) -> tuple[int, int, float, float, float]:
    # Two timeline frames share a pose: 12 fps playback, intentionally stepped 6 fps motion.
    step = frame // 2
    steps = max(1, count // 2)
    phase = 2 * math.pi * step / steps
    wave = math.sin(phase)
    pulse = math.sin(phase * 2)

    if name == "idle": return (0, round(-wave), 0, 1 + .010 * pulse, 1 - .012 * wave)
    if name == "listen": return (round(2 * wave), round(-abs(wave)), 3.0 * wave, 1, 1)
    if name == "pet": return (round(-2 - 2 * abs(wave)), round(-abs(wave)), -4 - 2 * wave, 1.01, 1)
    if name == "feed": return (0, round(2 * abs(wave)), 1.2 * wave, 1 + .012 * pulse, 1 - .020 * abs(wave))
    if name == "happy": return (round(wave), round(-5 * abs(wave)), -1.5 * wave, 1 + .025 * abs(wave), 1 - .025 * abs(wave))
    if name == "quiet": return (0, round(abs(wave)), .5 * wave, 1, 1 - .008 * abs(wave))
    if name == "sad": return (0, round(1 + 2 * abs(wave)), .8 * wave, 1, 1 - .014 * abs(wave))
    if name == "withdrawn": return (0, 0 if step % 8 else 1, .35 if step % 11 == 0 else 0, 1, 1)
    if name == "stretch": return (round(2 * wave), round(abs(wave)), 1.2 * wave, 1 + .035 * abs(wave), 1 - .025 * abs(wave))
    if name == "drink": return (0, round(2 * abs(wave)), 1.0 * wave, 1, 1 - .018 * abs(wave))
    if name == "yawn": return (0, round(-2 * abs(wave)), -1.3 * wave, 1 + .018 * abs(wave), 1 + .025 * abs(wave))
    if name == "sleep": return (0, 0, 0, 1 + .012 * wave, 1 - .010 * wave)
    if name == "hungry": return (round(2 * wave), round(-abs(wave)), -2.5 * wave, 1, 1)
    if name == "thirsty": return (round(wave), round(abs(wave)), 2.0 * wave, 1, 1)
    if name == "offended": return (round(2 * max(0, wave)), 0, 2.5 * wave, 1, 1)
    if name == "lesson": return (round(2 * wave), round(-4 * abs(wave)), -2.0 * wave, 1 + .018 * abs(wave), 1 - .018 * abs(wave))
    return (0, 0, 0, 1, 1)


def rgb_for_palette(frame: Image.Image) -> Image.Image:
    rgb = Image.new("RGB", frame.size, TRANSPARENT_RGB)
    rgb.paste(frame.convert("RGB"), mask=frame.getchannel("A"))
    return rgb


def save_paletted_sequence(frames: list[Image.Image], folder: Path) -> None:
    strip = Image.new("RGB", (SIZE, SIZE * len(frames)), TRANSPARENT_RGB)
    for index, frame in enumerate(frames):
        strip.paste(rgb_for_palette(frame), (0, SIZE * index))
    palette_image = strip.quantize(colors=64, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    transparent_index = palette_image.getpixel((0, 0))
    palette = palette_image.getpalette()
    assert palette is not None

    folder.mkdir(parents=True, exist_ok=True)
    for old in folder.glob("*.png"):
        old.unlink()
    for index, frame in enumerate(frames):
        paletted = rgb_for_palette(frame).quantize(palette=palette_image, dither=Image.Dither.NONE)
        paletted.putpalette(palette)
        paletted.save(folder / f"{index:03d}.png", optimize=True, transparency=transparent_index)


def save_static(image: Image.Image, destination: Path) -> None:
    rgb = rgb_for_palette(image)
    paletted = rgb.quantize(colors=64, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    transparent_index = paletted.getpixel((0, 0))
    paletted.save(destination, optimize=True, transparency=transparent_index)


def main() -> None:
    if not ATLAS.exists():
        raise SystemExit(f"Missing atlas: {ATLAS}")
    STATIC_DIR.mkdir(parents=True, exist_ok=True)
    FRAME_DIR.mkdir(parents=True, exist_ok=True)
    atlas = remove_checkerboard(Image.open(ATLAS))
    poses = atlas_poses(atlas)

    for old in STATIC_DIR.glob("*.png"):
        old.unlink()
    for name, pose in poses.items():
        save_static(pose, STATIC_DIR / f"{name}.png")
        count = DURATIONS[name] * FPS
        frames = [transformed(pose, *motion(name, frame, count)) for frame in range(count)]
        save_paletted_sequence(frames, FRAME_DIR / name)
        print(f"{name}: {count} timeline frames at {FPS} fps")

    # Keep generated directories deterministic when the pose list changes.
    for child in FRAME_DIR.iterdir():
        if child.is_dir() and child.name not in POSES:
            shutil.rmtree(child)


if __name__ == "__main__":
    main()
