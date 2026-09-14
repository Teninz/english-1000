"""Render companion sprites from Free/Models/Fbx/Singlemodel/01foxFinal.fbx.

The source FBX and texture are never modified. The script writes transparent PNG
sprites to art/companion/ and a recoverable Blender scene to Free/derived/.
"""
import bpy
import math
import os
from mathutils import Matrix, Vector

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCE = os.path.join(ROOT, "Free", "Models", "Fbx", "Singlemodel", "01foxFinal.fbx")
ORIGINAL_TEXTURE = os.path.join(ROOT, "Free", "Texture", "01foxtexture.png")
SHADOWFOX_TEXTURE = os.path.join(ROOT, "Free", "derived", "fox-shadowfox-texture.png")
TEXTURE = SHADOWFOX_TEXTURE if os.path.exists(SHADOWFOX_TEXTURE) else ORIGINAL_TEXTURE
OUT = os.path.join(ROOT, "art", "companion")
DERIVED = os.path.join(ROOT, "Free", "derived")
os.makedirs(OUT, exist_ok=True)
os.makedirs(DERIVED, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=SOURCE)
fox = next(o for o in bpy.context.scene.objects if o.type == "MESH")
fox.name = "ShadowFoxCompanion"

material = bpy.data.materials.new("CompanionFoxTexture")
material.use_nodes = True
nodes = material.node_tree.nodes
bsdf = nodes.get("Principled BSDF")
image_node = nodes.new("ShaderNodeTexImage")
image_node.image = bpy.data.images.load(TEXTURE)
material.node_tree.links.new(image_node.outputs["Color"], bsdf.inputs["Base Color"])
bsdf.inputs["Roughness"].default_value = 0.8
fox.data.materials.clear()
fox.data.materials.append(material)

def solid_material(name, color):
    result = bpy.data.materials.new(name)
    result.diffuse_color = color
    result.use_nodes = True
    shader = result.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = color
    shader.inputs["Roughness"].default_value = 0.84
    return result

chest_terracotta = solid_material("ChestTerracotta", (0.15, 0.008, 0.001, 1.0))
chest_amber = solid_material("ChestAmber", (0.33, 0.028, 0.001, 1.0))
fox.data.materials.append(chest_terracotta)
fox.data.materials.append(chest_amber)

# Texture islands are shared by unrelated body parts. Select the breast on the
# mesh itself so the warm accent cannot leak onto the ears, back, legs or tail.
for polygon in fox.data.polygons:
    center = polygon.center
    if 38.0 < center.y < 62.0 and 7.0 < center.z < 34.0:
        polygon.material_index = 2 if center.z > 19.0 and abs(center.x) < 13.5 else 1

base = [v.co.copy() for v in fox.data.vertices]
# The FBX imports rotated by +90° around X. In mesh-local coordinates Y is up,
# the muzzle points toward +Z and the tail toward -Z.
ground = min(v.y for v in base)

def rotate(point, pivot, axis, angle):
    return pivot + Matrix.Rotation(angle, 4, axis) @ (point - pivot)

def pose(name):
    settings = {
        "idle":    dict(head=0.00, tilt=0.00, tail_x=0.05, tail_z=0.04, squash=1.00),
        "curious": dict(head=0.10, tilt=0.16, tail_x=0.10, tail_z=-0.10, squash=1.00),
        "happy":   dict(head=0.20, tilt=-0.05, tail_x=0.26, tail_z=0.22, squash=1.02),
        "feed":    dict(head=-0.35, tilt=0.00, tail_x=0.02, tail_z=0.00, squash=0.96),
        "pet":     dict(head=0.25, tilt=-0.16, tail_x=0.18, tail_z=0.32, squash=1.00),
        "sad-1":   dict(head=-0.15, tilt=0.00, tail_x=-0.16, tail_z=0.00, squash=0.94),
        "sad-2":   dict(head=-0.30, tilt=0.04, tail_x=-0.30, tail_z=0.00, squash=0.86),
        "sleep":   dict(head=-0.42, tilt=0.10, tail_x=-0.38, tail_z=0.46, squash=0.70),
    }[name]
    head_pivot = Vector((0, 70, 28))
    tail_pivot = Vector((0, 56, -32))
    for vertex, original in zip(fox.data.vertices, base):
        point = original.copy()
        # Keep paws on the same floor while lowering the body.
        point.y = ground + (point.y - ground) * settings["squash"]
        if original.z > 28:
            influence = max(0.0, min(1.0, (original.z - 28) / 46))
            point = rotate(point, head_pivot, "X", settings["head"] * influence)
            point = rotate(point, head_pivot, "Z", settings["tilt"] * influence)
        if original.z < -32:
            influence = max(0.0, min(1.0, (-32 - original.z) / 76))
            point = rotate(point, tail_pivot, "X", settings["tail_x"] * influence)
            point = rotate(point, tail_pivot, "Y", settings["tail_z"] * influence)
        vertex.co = point
    fox.data.update()

world = bpy.data.worlds.new("CompanionWorld")
bpy.context.scene.world = world
world.use_nodes = True
world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.018, 0.022, 0.03, 1)
world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.32

bpy.ops.object.light_add(type="AREA", location=(2.6, -3.5, 4.2))
key = bpy.context.object
key.name = "WarmKey"
key.data.energy = 1450
key.data.shape = "DISK"
key.data.size = 4.0
key.data.color = (1.0, 0.72, 0.5)
bpy.ops.object.light_add(type="AREA", location=(-3.5, 1.5, 2.4))
fill = bpy.context.object
fill.name = "AmberRim"
fill.data.energy = 900
fill.data.size = 3.0
fill.data.color = (1.0, 0.28, 0.08)
bpy.ops.object.light_add(type="AREA", location=(0.4, -4.2, 2.0))
front = bpy.context.object
front.name = "CoolFront"
front.data.energy = 850
front.data.size = 5.0
front.data.color = (0.50, 0.62, 1.0)

bpy.ops.object.camera_add()
camera = bpy.context.object
camera.name = "CompanionCamera"
camera.data.lens = 68
camera.location = (3.3, -3.0, 1.2)
bpy.context.scene.camera = camera

scene = bpy.context.scene
scene.render.engine = "BLENDER_EEVEE"
scene.render.resolution_x = 640
scene.render.resolution_y = 640
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = "PNG"
scene.render.image_settings.color_mode = "RGBA"
scene.render.film_transparent = True
scene.view_settings.look = "AgX - Medium High Contrast"

def aim(target):
    camera.rotation_euler = (Vector(target) - camera.location).to_track_quat("-Z", "Y").to_euler()

for name in ("idle", "curious", "happy", "feed", "pet", "sad-1", "sad-2", "sleep"):
    pose(name)
    aim((0, 0.43, 0.82 if name != "sleep" else 0.58))
    scene.render.filepath = os.path.join(OUT, name + ".png")
    bpy.ops.render.render(write_still=True)

pose("idle")
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(DERIVED, "fox-companion-render.blend"))
print("Rendered companion sprites:", OUT)
