"""Extract the seven key poses from the reference contact sheet.

The output is an art source for the hand-drawn animation pass. It deliberately
does not interpolate or warp the character: intermediate frames must be drawn
per layer so that eyes, ears, body, tail and scarf follow their own arcs.
"""

from pathlib import Path
from collections import deque

from PIL import Image


ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "tools" / "companion-source" / "reference-chain-v1.png"
OUTPUT = ROOT / "tools" / "companion-source" / "reference-keyframes"
SIZE = 256
SAFE = 16

# Bounds were measured from the alpha silhouette of each panel. Keeping them
# explicit makes reruns deterministic and avoids accidental crop changes.
PANEL_BOUNDS = [
    (33, 181, 309, 568),
    (310, 186, 620, 568),
    (621, 212, 930, 568),
    (931, 156, 1240, 568),
    (1241, 158, 1550, 568),
    (1551, 186, 1861, 568),
    (1862, 181, 2154, 568),
]

# Use one scale for the whole chain. The original contact sheet has a common
# ground line; per-pose fitting would make the fox visibly grow and shrink.
REFERENCE_SCALE = 224 / 413

NAMES = ["idle", "notice", "focus", "happy", "happy-hold", "settle", "idle-return"]


def remove_panel_fragments(image: Image.Image) -> Image.Image:
    """Keep the centered fox and remove alpha fragments from adjacent panels."""
    alpha = image.getchannel("A")
    pixels = alpha.load()
    width, height = image.size
    seen: set[tuple[int, int]] = set()
    components: list[list[tuple[int, int]]] = []
    for y in range(height):
        for x in range(width):
            if pixels[x, y] <= 8 or (x, y) in seen:
                continue
            queue = deque([(x, y)])
            seen.add((x, y))
            component: list[tuple[int, int]] = []
            while queue:
                px, py = queue.popleft()
                component.append((px, py))
                for nx, ny in ((px - 1, py), (px + 1, py), (px, py - 1), (px, py + 1)):
                    if 0 <= nx < width and 0 <= ny < height and pixels[nx, ny] > 8 and (nx, ny) not in seen:
                        seen.add((nx, ny))
                        queue.append((nx, ny))
            components.append(component)
    if not components:
        return image
    center_x = width / 2
    main = max(
        components,
        key=lambda points: len(points) - abs(sum(x for x, _ in points) / len(points) - center_x) * 20,
    )
    keep = set(main)
    cleaned = image.copy()
    data = cleaned.load()
    for y in range(height):
        for x in range(width):
            if (x, y) not in keep:
                data[x, y] = (0, 0, 0, 0)
    return cleaned


def extract() -> None:
    if not SOURCE.exists():
        raise SystemExit(f"Missing source: {SOURCE}")
    source = Image.open(SOURCE).convert("RGBA")
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for old in OUTPUT.glob("*.png"):
        old.unlink()

    for name, bounds in zip(NAMES, PANEL_BOUNDS):
        pose = remove_panel_fragments(source.crop(bounds))
        alpha = pose.getchannel("A")
        bbox = alpha.getbbox()
        if bbox is None:
            raise ValueError(f"{name}: empty alpha")
        pose = pose.crop(bbox)
        pose = pose.resize(
            (round(pose.width * REFERENCE_SCALE), round(pose.height * REFERENCE_SCALE)),
            Image.Resampling.NEAREST,
        )
        canvas = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
        # Keep the measured floor at y=240 across every key pose.
        floor = 240
        canvas.alpha_composite(pose, ((SIZE - pose.width) // 2, floor - pose.height))
        visible = canvas.getchannel("A").getbbox()
        assert visible is not None
        assert visible[0] >= SAFE and visible[1] >= SAFE
        assert visible[2] <= SIZE - SAFE and visible[3] <= SIZE - SAFE
        out = OUTPUT / f"{name}.png"
        canvas.save(out, optimize=True)
        print(f"{name}: {pose.width}x{pose.height} -> {out}")


if __name__ == "__main__":
    extract()
