"""Local, repeatable preparation of the single generated fox sheet.

No API calls. Preserves the source, separates connected objects, prepares an
editable layer rig and bakes a 100-frame motion study. Not shipped in the APK.
Requires Pillow (the project's existing art dependency).
"""
from __future__ import annotations

from collections import deque
from pathlib import Path
import hashlib
import base64
import json
import math
import shutil
import xml.etree.ElementTree as ET
import zipfile
from io import BytesIO

from PIL import Image, ImageChops, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
SOURCE_DIR = ROOT / "tools/companion-source"
OUT = SOURCE_DIR / "layer-prototype-v1"
SIZE = 256
NAMES = [
    "head-neutral", "head-raised", "head-wink", "head-focus",
    "ear-left", "ear-right", "muzzle-neutral", "muzzle-smile",
    "body-with-tail", "leaf-cluster", "tail-neutral", "tail-lifted",
    "scarf", "leaf", "front-legs", "body-no-tail",
]


def dump(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def components(image):
    """Locate complete objects, independent of nominal cell boundaries."""
    mask = image.getchannel("A").point(lambda p: 255 if p >= 32 else 0)
    w, h = image.size
    pixels = mask.tobytes()
    seen = bytearray(w * h)
    groups = []
    for pos, value in enumerate(pixels):
        if not value or seen[pos]:
            continue
        queue = deque([pos])
        seen[pos] = 1
        points = []
        while queue:
            p = queue.popleft()
            points.append(p)
            x, y = p % w, p // w
            neighbors = []
            if x: neighbors.append(p - 1)
            if x < w - 1: neighbors.append(p + 1)
            if y: neighbors.append(p - w)
            if y < h - 1: neighbors.append(p + w)
            for n in neighbors:
                if pixels[n] and not seen[n]:
                    seen[n] = 1
                    queue.append(n)
        if len(points) >= 400:
            xs, ys = [p % w for p in points], [p // w for p in points]
            groups.append((min(xs), min(ys), max(xs) + 1, max(ys) + 1))
    # Row IDs only sort whole objects; they never crop through them.
    return sorted(groups, key=lambda b: (int(((b[1]+b[3])/2) / (h/4)), b[0]))


def prepare_parts():
    OUT.mkdir(parents=True, exist_ok=True)
    raw = SOURCE_DIR / "fox-layer-master-sheet-v1-source.png"
    generated = ROOT / "output/imagegen/fox-layer-master-sheet-v1.png"
    if not raw.exists():
        shutil.copyfile(generated, raw)
    sheet = Image.open(SOURCE_DIR / "fox-layer-master-sheet-v1-alpha.png").convert("RGBA")
    bounds = components(sheet)
    if len(bounds) != 16:
        raise ValueError(f"Expected 16 complete objects, found {len(bounds)}")
    parts = {}
    manifest = []
    parts_dir = OUT / "parts"
    parts_dir.mkdir(exist_ok=True)
    atlas = Image.new("RGBA", (2048, 2048))
    review = Image.new("RGBA", (1024, 1024), "#1c202a")
    for i, (name, b) in enumerate(zip(NAMES, bounds)):
        # Keep 2 pixels of the soft contour around the opaque component.
        b = (max(0, b[0]-2), max(0, b[1]-2), min(sheet.width, b[2]+2), min(sheet.height, b[3]+2))
        part = sheet.crop(b)
        parts[name] = part
        part.save(parts_dir / f"{name}.png", optimize=True)
        # Native pixels in 512px cells: repacking, no fictitious upscaled detail.
        atlas.alpha_composite(part, ((i%4)*512+(512-part.width)//2, (i//4)*512+(512-part.height)//2))
        small = part.copy()
        small.thumbnail((222, 216), Image.Resampling.NEAREST)
        review.alpha_composite(small, ((i%4)*256+(256-small.width)//2, (i//4)*256+(220-small.height)//2))
        ImageDraw.Draw(review).text(((i%4)*256+12, (i//4)*256+234), name, fill="#f4b070")
        manifest.append({"id": name, "sourceBounds": b, "size": part.size, "file": f"parts/{name}.png"})
    atlas.save(OUT / "parts-master-2k.png", optimize=True)
    review.save(OUT / "parts-review.png", optimize=True)
    dump(OUT / "parts.json", {"sourceSize": sheet.size, "objects": manifest, "masterSize": [2048,2048]})
    return parts, raw


def polygon_mask(size, points):
    mask = Image.new("L", size)
    ImageDraw.Draw(mask).polygon(points, fill=255)
    return mask


def split(image, polygons):
    """Disjoint masks; compositing these layers reproduces the source exactly."""
    remaining = image.copy()
    result = {}
    for name, points in polygons:
        mask = polygon_mask(image.size, points)
        part = remaining.copy()
        part.putalpha(ImageChops.multiply(remaining.getchannel("A"), mask))
        remaining.putalpha(ImageChops.multiply(remaining.getchannel("A"), ImageChops.invert(mask)))
        result[name] = part
    result["base"] = remaining
    check = remaining.copy()
    for part in result.values():
        if part is not remaining:
            check.alpha_composite(part)
    # Compare visible RGB and alpha; transparent RGB carries no visual meaning.
    for bg in ("#000000", "#ffffff"):
        original = Image.new("RGBA", image.size, bg)
        original.alpha_composite(image)
        rebuilt = Image.new("RGBA", image.size, bg)
        rebuilt.alpha_composite(check)
        assert original.tobytes() == rebuilt.tobytes(), "Layer partition changed the source"
    return result


def place(image, width, xy):
    h = round(image.height*width/image.width)
    item = image.resize((width,h), Image.Resampling.NEAREST)
    canvas = Image.new("RGBA", (SIZE,SIZE))
    canvas.alpha_composite(item, xy)
    return canvas


def prepare_rig(parts):
    head = place(parts["head-neutral"], 116, (100, 23))
    # Coordinates in the final 256px rig canvas; each region remains editable.
    head_parts = split(head, [
        ("ear-left", [(96,20),(130,20),(155,75),(135,97),(98,95)]),
        ("ear-right", [(164,18),(211,18),(215,82),(171,77)]),
        ("eye-near", [(144,94),(171,91),(178,105),(173,124),(148,124),(140,111)]),
        ("eye-far", [(183,87),(203,84),(204,105),(199,116),(183,115)]),
        ("muzzle", [(179,122),(213,115),(222,130),(215,147),(176,149),(160,139)]),
    ])
    body = place(parts["body-no-tail"], 105, (100, 128))
    body_parts = split(body, [
        ("front-legs", [(137,183),(184,183),(206,210),(207,245),(133,245)]),
        ("chest", [(145,129),(190,129),(192,168),(169,188),(146,169)]),
    ])
    layers = {
        "tail": place(parts["tail-neutral"], 84, (43,149)),
        "body": body_parts["base"], "chest": body_parts["chest"],
        "front-legs": body_parts["front-legs"],
        "scarf": place(parts["scarf"], 105, (98,127)),
        "head": head_parts["base"],
        "ear-left": head_parts["ear-left"], "ear-right": head_parts["ear-right"],
        "eye-near": head_parts["eye-near"], "eye-far": head_parts["eye-far"],
        "muzzle": head_parts["muzzle"],
        "leaf": place(parts["leaf"], 33, (167,133)),
    }
    # Keep editable partitions exact. At render time reconnect each anatomical
    # surface BEFORE resampling, so transparent cut edges cannot open seams.
    layer_dir = OUT/"layers"
    layer_dir.mkdir(exist_ok=True)
    metadata=[]
    pivots={"tail":(117,221),"head":(161,137),"ear-left":(133,89),"ear-right":(189,79),
            "eye-near":(159,109),"eye-far":(194,100),"muzzle":(187,136),
            "scarf":(154,137),"leaf":(175,140),"body":(158,235),"chest":(165,160),"front-legs":(163,235)}
    for name, layer in layers.items():
        assert layer.getbbox(), name
        layer.save(layer_dir/f"{name}.png",optimize=True)
        metadata.append({"id":name,"file":f"layers/{name}.png","pivot":pivots[name],
                         "parent":"head" if name in head_parts and name!="base" else None})
    dump(OUT/"rig.json",{"canvas":[256,256],"status":"motion-study",
        "surfaceRendering":"continuous-mesh-before-resampling",
        "layerOrder":list(layers),"layers":metadata,"attachments":{"head":[161,75],"body":[158,156],"gear":[179,144]},
        "limitations":["Independent eye animation still needs painted sockets.",
                       "Large muzzle turns need drawn pose replacements.",
                       "Artwork proportions differ from the approved reference.",
                       "Garments are separate; no production wardrobe is implemented."]})
    return layers, pivots


def transform(layer, pivot, dx=0, dy=0, angle=0, sx=1, sy=1):
    """Inverse affine transformation about an explicit parent-space pivot."""
    a=math.radians(angle); c,s=math.cos(a),math.sin(a)
    px,py=pivot
    coeff=(c/sx,s/sx,px-(c*(px+dx)+s*(py+dy))/sx,
           -s/sy,c/sy,py-(-s*(px+dx)+c*(py+dy))/sy)
    return layer.transform((256,256),Image.Transform.AFFINE,coeff,Image.Resampling.BILINEAR)


def combine(layers, names):
    surface=Image.new("RGBA",(SIZE,SIZE))
    for name in names:
        surface.alpha_composite(layers[name])
    return surface


def smooth(value):
    t=max(0,min(1,value))
    return t*t*(3-2*t)


def mesh_warp(surface, inverse):
    """Shared vertices form one continuous surface, with no masked cut edges."""
    mesh=[]
    for y in range(0,SIZE,4):
        for x in range(0,SIZE,4):
            points=[inverse(px,py) for px,py in ((x,y),(x,y+4),(x+4,y+4),(x+4,y))]
            mesh.append(((x,y,x+4,y+4),tuple(c for point in points for c in point)))
    return surface.transform((SIZE,SIZE),Image.Transform.MESH,mesh,Image.Resampling.BILINEAR)


def body_inverse(p):
    amplitude=(p["chestScaleY"]-1)*.7
    def inverse(x,y):
        # Match the old chest lift at y<=170; smoothly pin every paw at y>=215.
        influence=1-smooth((y-170)/45)
        return x,y+(235-y)*amplitude*influence
    return inverse


def head_inverse(p,pivots):
    angle=math.radians(p["headAngle"]*.65)
    c,s=math.cos(angle),math.sin(angle)
    px,py=pivots["head"]
    def inverse(x,y):
        dx=x-px-p["headX"]*.55;dy=y-py-p["headY"]*.38
        hx,hy=px+c*dx+s*dy,py-s*dx+c*dy
        ox,oy=hx,hy
        for name,key in (("ear-left","leftEarAngle"),("ear-right","rightEarAngle")):
            ex,ey=pivots[name]
            weight=smooth((ey-hy)/28)*(1-smooth((abs(hx-ex)-13)/21))
            a=math.radians(p[key]*.35)*weight
            # Rotation fades continuously to zero at the ear root.
            ox+=ex+math.cos(a)*(hx-ex)+math.sin(a)*(hy-ey)-hx
            oy+=ey-math.sin(a)*(hx-ex)+math.cos(a)*(hy-ey)-hy
        return ox,oy
    return inverse


def export_ora(layers):
    merged=Image.new("RGBA",(256,256))
    for im in layers.values():merged.alpha_composite(im)
    def png(im):
        stream=BytesIO();im.save(stream,format="PNG");return stream.getvalue()
    root=ET.Element("image",{"w":"256","h":"256","name":"ShadowFox layer motion study","version":"0.0.3"})
    stack=ET.SubElement(root,"stack")
    with zipfile.ZipFile(OUT/"fox-layer-master.ora","w") as archive:
        archive.writestr("mimetype","image/openraster",compress_type=zipfile.ZIP_STORED)
        for i,(name,im) in enumerate(reversed(list(layers.items()))):
            src=f"data/layer{i}.png"
            ET.SubElement(stack,"layer",{"name":name,"src":src,"x":"0","y":"0","opacity":"1.0",
                                        "visibility":"visible","composite-op":"svg:src-over"})
            archive.writestr(src,png(im))
        archive.writestr("stack.xml",ET.tostring(root,encoding="utf-8"))
        archive.writestr("mergedimage.png",png(merged))
    merged.save(OUT/"assembled.png",optimize=True)


def render(layers,pivots):
    plan=json.loads((SOURCE_DIR/"reference-chain-v1.motion.json").read_text())
    frames=[]
    head_surface=combine(layers,("head","ear-left","ear-right","eye-near","eye-far","muzzle"))
    body_surface=combine(layers,("body","chest","front-legs"))
    for frame in plan["frames"]:
        p=frame["pose"]
        out=Image.new("RGBA",(256,256))
        for name,original in layers.items():
            image=original
            if name=="tail":
                image=transform(image,pivots[name],angle=p["tailLift"]*.65)
            elif name=="body":
                image=mesh_warp(body_surface,body_inverse(p))
            elif name in ("chest","front-legs","ear-left","ear-right","eye-near","eye-far","muzzle"):
                continue
            elif name=="scarf":
                image=transform(image,pivots[name],angle=p["scarfLift"]*.4)
            elif name=="leaf":
                image=transform(image,pivots[name],angle=p["leafAngle"]*.7)
            elif name=="head":
                image=mesh_warp(head_surface,head_inverse(p,pivots))
            out.alpha_composite(image)
        box=out.getbbox()
        assert box and min(box[:2])>=16 and max(box[2:])<=240, (frame["frame"],box)
        frames.append(out)
    assert frames[0].tobytes()==frames[-1].tobytes()
    unique=len({hashlib.sha256(im.tobytes()).hexdigest() for im in frames})
    frame_dir=OUT/"frames"
    frame_dir.mkdir(exist_ok=True)
    for i,im in enumerate(frames):im.save(frame_dir/f"{i:03d}.png",optimize=True)
    frames[0].save(OUT/"motion-study.png",save_all=True,append_images=frames[1:],duration=50,loop=0,disposal=0,blend=0)
    with Image.open(OUT/"motion-study.png") as animation:
        assert animation.n_frames == 100
        total_ms = 0
        for i in range(100):
            animation.seek(i)
            total_ms += animation.info["duration"]
            assert animation.convert("RGBA").tobytes() == frames[i].tobytes()
        assert total_ms == 5000
    pages=[]
    for start in range(0,100,25):
        atlas=Image.new("RGBA",(1280,1280))
        for j,im in enumerate(frames[start:start+25]):atlas.alpha_composite(im,((j%5)*256,(j//5)*256))
        filename=f"atlas-{start//25}.webp"
        atlas.save(OUT/filename,lossless=True)
        with Image.open(OUT/filename) as decoded:
            for j,frame in enumerate(frames[start:start+25]):
                tile=decoded.crop(((j%5)*256,(j//5)*256,(j%5+1)*256,(j//5+1)*256)).convert("RGBA")
                # WebP may normalize invisible RGB. Compare on an opaque background.
                expected=Image.new("RGBA",(256,256),"#20242e")
                actual=expected.copy()
                expected.alpha_composite(frame)
                actual.alpha_composite(tile)
                assert expected.tobytes()==actual.tobytes()
        pages.append(filename)
    contact=Image.new("RGBA",(256*5,290),"#20242e")
    for i,k in enumerate([0,25,50,75,99]):
        contact.alpha_composite(frames[k],(i*256,0))
        ImageDraw.Draw(contact).text((i*256+16,267),f"{k:03d} / {k*50} ms",fill="#f4b070")
    contact.save(OUT/"motion-contact.png",optimize=True)
    dump(OUT/"animation.json",{"fps":20,"durationMs":5000,"frameCount":100,"size":[256,256],
                              "columns":5,"framesPerPage":25,"pages":pages,"loop":True,"status":"motion-study"})
    dump(OUT/"validation.json",{"frames":100,"distinctFrames":unique,"safeMargin":16,
        "loopPixelsMatch":True,"layerCount":len(layers),"sourcePartitionsReconstruct":True,
        "decodedApngMatchesFrames":True,"decodedAtlasMatchesFrames":True,"decodedDurationMs":total_ms,
        "atlasBytes":sum((OUT/p).stat().st_size for p in pages),"deviceTested":False,
        "notValidated":["anatomical realism","final expression animation","runtime performance","wardrobe deformation"]})
    print(f"{len(layers)} layers; {len(frames)} frames ({unique} distinct); safe border and loop OK")
    data_urls=["data:image/webp;base64,"+base64.b64encode((OUT/p).read_bytes()).decode() for p in pages]
    template=Path(__file__).with_name("fox-layer-preview-template.html").read_text(encoding="utf-8")
    (OUT/"preview.html").write_text(template.replace("__ATLAS_DATA__",json.dumps(data_urls)),encoding="utf-8")


def main():
    parts,raw=prepare_parts()
    layers,pivots=prepare_rig(parts)
    export_ora(layers)
    render(layers,pivots)
    dump(OUT/"provenance.json",{"requestedModel":"gpt-image-2","execution":"imagegen bundled CLI edit",
        "source":str(raw.relative_to(ROOT)),"sha256":hashlib.sha256(raw.read_bytes()).hexdigest(),
        "requestedSize":[1536,1024],"returnedSize":list(Image.open(raw).size),
        "paidGenerationsThisPass":0,"additionalDetailFrom2kRepack":False})


if __name__=="__main__":
    main()

