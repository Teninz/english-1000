"""Build and render the ShadowFox companion rig.

The source FBX and textures are read-only inputs. This script creates a derived
Blender scene plus transparent animation frame sequences for the APK.
"""
from __future__ import annotations

import math
import os
from pathlib import Path

import bpy
from mathutils import Vector


ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "Free" / "Models" / "Fbx" / "Singlemodel" / "01foxFinal.fbx"
ORIGINAL_TEXTURE = ROOT / "Free" / "Texture" / "01foxtexture.png"
SHADOWFOX_TEXTURE = ROOT / "Free" / "derived" / "fox-shadowfox-texture.png"
DERIVED_BLEND = ROOT / "Free" / "derived" / "fox-companion-rig.blend"
FRAME_ROOT = ROOT / "art" / "companion-anim-frames"
FPS = 30
SAMPLE_STEP = 5  # 6 rendered frames per second; motion is interpolated in Blender.


def material_with_texture(path: Path):
    material = bpy.data.materials.new("ShadowFoxTexture")
    material.use_nodes = True
    nodes = material.node_tree.nodes
    shader = nodes.get("Principled BSDF")
    image = nodes.new("ShaderNodeTexImage")
    image.image = bpy.data.images.load(str(path))
    material.node_tree.links.new(image.outputs["Color"], shader.inputs["Base Color"])
    shader.inputs["Roughness"].default_value = 0.82
    return material


def solid_material(name, color):
    material = bpy.data.materials.new(name)
    material.diffuse_color = color
    material.use_nodes = True
    shader = material.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = color
    shader.inputs["Roughness"].default_value = 0.84
    return material


def add_bone(edit_bones, name, head, tail, parent=None, deform=True, connected=False):
    bone = edit_bones.new(name)
    bone.head = head
    bone.tail = tail
    bone.use_deform = deform
    bone.use_connect = connected
    if parent:
        bone.parent = edit_bones[parent]
    return bone


def create_armature():
    data = bpy.data.armatures.new("ShadowFoxCompanionRig")
    rig = bpy.data.objects.new("ShadowFoxCompanionRig", data)
    bpy.context.collection.objects.link(rig)
    bpy.context.view_layer.objects.active = rig
    rig.select_set(True)
    bpy.ops.object.mode_set(mode="EDIT")
    bones = data.edit_bones

    add_bone(bones, "root", (0, 0, 0), (0, 0, 0.16), deform=False)
    add_bone(bones, "pelvis", (0, 0.28, 0.61), (0, 0.12, 0.64), "root")
    add_bone(bones, "spine.01", (0, 0.12, 0.64), (0, -0.02, 0.66), "pelvis", connected=True)
    add_bone(bones, "spine.02", (0, -0.02, 0.66), (0, -0.16, 0.68), "spine.01", connected=True)
    add_bone(bones, "chest", (0, -0.16, 0.68), (0, -0.30, 0.70), "spine.02", connected=True)
    add_bone(bones, "neck.01", (0, -0.30, 0.70), (0, -0.41, 0.77), "chest", connected=True)
    add_bone(bones, "neck.02", (0, -0.41, 0.77), (0, -0.51, 0.83), "neck.01", connected=True)
    add_bone(bones, "head", (0, -0.51, 0.83), (0, -0.68, 0.80), "neck.02", connected=True)
    add_bone(bones, "jaw", (0, -0.55, 0.72), (0, -0.77, 0.66), "head")

    add_bone(bones, "ear.L.01", (0.065, -0.50, 0.86), (0.085, -0.49, 0.98), "head")
    add_bone(bones, "ear.L.02", (0.085, -0.49, 0.98), (0.095, -0.48, 1.10), "ear.L.01", connected=True)
    add_bone(bones, "ear.R.01", (-0.065, -0.50, 0.86), (-0.085, -0.49, 0.98), "head")
    add_bone(bones, "ear.R.02", (-0.085, -0.49, 0.98), (-0.095, -0.48, 1.10), "ear.R.01", connected=True)

    tail_points = [
        (0, 0.28, 0.61), (0, 0.40, 0.58), (0, 0.53, 0.53),
        (0, 0.66, 0.46), (0, 0.78, 0.38), (0, 0.89, 0.29),
        (0, 0.98, 0.21), (0, 1.06, 0.15), (0, 1.11, 0.11),
        (0, 1.14, 0.09),
    ]
    parent = "pelvis"
    for index in range(9):
        name = f"tail.{index + 1:02d}"
        add_bone(bones, name, tail_points[index], tail_points[index + 1], parent, connected=index > 0)
        parent = name

    for side, x in (("L", 0.145), ("R", -0.145)):
        add_bone(bones, f"scapula.{side}", (x * 0.45, -0.18, 0.76), (x, -0.27, 0.62), "chest")
        add_bone(bones, f"front_upper.{side}", (x, -0.27, 0.62), (x * 1.10, -0.22, 0.40), f"scapula.{side}", connected=True)
        add_bone(bones, f"front_lower.{side}", (x * 1.10, -0.22, 0.40), (x * 0.98, -0.24, 0.14), f"front_upper.{side}", connected=True)
        add_bone(bones, f"front_paw.{side}", (x * 0.98, -0.24, 0.14), (x * 0.96, -0.31, 0.025), f"front_lower.{side}", connected=True)
        add_bone(bones, f"front_toe.{side}", (x * 0.96, -0.31, 0.025), (x * 0.94, -0.40, 0.015), f"front_paw.{side}", connected=True)

        add_bone(bones, f"thigh.{side}", (x, 0.25, 0.62), (x * 1.10, 0.13, 0.40), "pelvis")
        add_bone(bones, f"shin.{side}", (x * 1.10, 0.13, 0.40), (x * 0.98, 0.33, 0.16), f"thigh.{side}", connected=True)
        add_bone(bones, f"hind_paw.{side}", (x * 0.98, 0.33, 0.16), (x * 0.96, 0.30, 0.035), f"shin.{side}", connected=True)
        add_bone(bones, f"hind_toe.{side}", (x * 0.96, 0.30, 0.035), (x * 0.94, 0.21, 0.015), f"hind_paw.{side}", connected=True)

        add_bone(bones, f"IK.front.{side}", (x, -0.31, 0.025), (x, -0.31, 0.13), "root", deform=False)
        add_bone(bones, f"POLE.front.{side}", (x * 2.0, -0.58, 0.40), (x * 2.0, -0.58, 0.50), "root", deform=False)
        add_bone(bones, f"IK.hind.{side}", (x, 0.30, 0.035), (x, 0.30, 0.14), "root", deform=False)
        add_bone(bones, f"POLE.hind.{side}", (x * 2.0, 0.02, 0.40), (x * 2.0, 0.02, 0.50), "root", deform=False)

    add_bone(bones, "CTRL.body", (0, 0.08, 0.74), (0, 0.08, 0.92), "root", deform=False)
    add_bone(bones, "CTRL.head", (0, -0.56, 0.88), (0, -0.56, 1.03), "root", deform=False)
    add_bone(bones, "CTRL.look", (0, -1.02, 0.82), (0, -1.02, 0.94), "root", deform=False)
    add_bone(bones, "CTRL.tail", (0, 0.46, 0.68), (0, 0.46, 0.84), "root", deform=False)
    add_bone(bones, "CTRL.ears", (0, -0.48, 1.12), (0, -0.48, 1.24), "root", deform=False)

    bpy.ops.object.mode_set(mode="POSE")
    # Production IK controls are available for hand-tuning. Animation actions
    # key the deformation chain directly, so constraints default to zero influence.
    for side in ("L", "R"):
        for limb, end, target, pole in (
            ("front", f"front_lower.{side}", f"IK.front.{side}", f"POLE.front.{side}"),
            ("hind", f"shin.{side}", f"IK.hind.{side}", f"POLE.hind.{side}"),
        ):
            constraint = rig.pose.bones[end].constraints.new("IK")
            constraint.name = f"{limb.upper()}_IK"
            constraint.target = rig
            constraint.subtarget = target
            constraint.pole_target = rig
            constraint.pole_subtarget = pole
            constraint.chain_count = 2
            constraint.influence = 0.0
    bpy.ops.object.mode_set(mode="OBJECT")
    return rig


def distance_to_segment(point, head, tail):
    segment = tail - head
    denominator = segment.length_squared
    if denominator == 0:
        return (point - head).length
    amount = max(0.0, min(1.0, (point - head).dot(segment) / denominator))
    return (point - (head + segment * amount)).length


def candidates_for(point):
    x, y, z = point
    side = "L" if x >= 0 else "R"
    if y > 0.42 and (z < 0.59 or y > 0.56):
        return [f"tail.{index:02d}" for index in range(1, 10)]
    if z > 0.87 and y < -0.36:
        return [f"ear.{side}.01", f"ear.{side}.02", "head"]
    if y < -0.43 and z > 0.53:
        return ["head", "jaw", "neck.02", "neck.01"]
    if y < -0.07 and z < 0.56 and abs(x) > 0.055:
        return [f"front_upper.{side}", f"front_lower.{side}", f"front_paw.{side}", f"front_toe.{side}", f"scapula.{side}"]
    if y > 0.02 and z < 0.56 and abs(x) > 0.055:
        return [f"thigh.{side}", f"shin.{side}", f"hind_paw.{side}", f"hind_toe.{side}", "pelvis"]
    return ["pelvis", "spine.01", "spine.02", "chest", "neck.01", "neck.02", "head"]


def skin_mesh(mesh, rig):
    deform = {bone.name: bone for bone in rig.data.bones if bone.use_deform}
    groups = {name: mesh.vertex_groups.new(name=name) for name in deform}
    unweighted = []
    for vertex in mesh.data.vertices:
        point = vertex.co
        distances = []
        for name in candidates_for(point):
            bone = deform[name]
            distances.append((distance_to_segment(point, bone.head_local, bone.tail_local), name))
        distances.sort()
        nearest = distances[:2]
        raw = [1.0 / max(distance, 0.012) ** 2 for distance, _ in nearest]
        total = sum(raw)
        if not total:
            unweighted.append(vertex.index)
            continue
        for strength, (_, name) in zip(raw, nearest):
            groups[name].add([vertex.index], strength / total, "REPLACE")

    modifier = mesh.modifiers.new("ShadowFoxArmature", "ARMATURE")
    modifier.object = rig
    mesh.parent = rig
    if unweighted:
        raise RuntimeError(f"Unweighted vertices: {unweighted}")


def assign_materials(mesh):
    texture = SHADOWFOX_TEXTURE if SHADOWFOX_TEXTURE.exists() else ORIGINAL_TEXTURE
    mesh.data.materials.clear()
    mesh.data.materials.append(material_with_texture(texture))
    mesh.data.materials.append(solid_material("ChestTerracotta", (0.15, 0.008, 0.001, 1.0)))
    mesh.data.materials.append(solid_material("ChestAmber", (0.33, 0.028, 0.001, 1.0)))
    for polygon in mesh.data.polygons:
        center = polygon.center
        if 0.38 < center.z < 0.62 and -0.34 < center.y < -0.07:
            polygon.material_index = 2 if center.y < -0.19 and abs(center.x) < 0.135 else 1


def reset_pose(rig):
    for bone in rig.pose.bones:
        bone.rotation_mode = "XYZ"
        bone.location = (0, 0, 0)
        bone.rotation_euler = (0, 0, 0)
        bone.scale = (1, 1, 1)


def set_pose(rig, values):
    reset_pose(rig)
    for name, channels in values.items():
        bone = rig.pose.bones[name]
        if "loc" in channels:
            bone.location = channels["loc"]
        if "rot" in channels:
            bone.rotation_euler = channels["rot"]
        if "scale" in channels:
            bone.scale = channels["scale"]


def create_action(rig, name, length, keys):
    action = bpy.data.actions.new(name)
    action.use_fake_user = True
    rig.animation_data.action = action
    # Every action owns a complete pose. Without zero keys for untouched bones,
    # Blender can retain the last pose from the previously active action.
    keyed_bones = [bone.name for bone in rig.pose.bones if bone.bone.use_deform or bone.name == "root"]
    for frame, pose in keys:
        bpy.context.scene.frame_set(frame)
        set_pose(rig, pose)
        for bone_name in keyed_bones:
            bone = rig.pose.bones[bone_name]
            bone.keyframe_insert("location", frame=frame, group=bone_name)
            bone.keyframe_insert("rotation_euler", frame=frame, group=bone_name)
            bone.keyframe_insert("scale", frame=frame, group=bone_name)
    action.frame_start = 1
    action.frame_end = length
    return action


def build_actions(rig):
    actions = {}
    actions["idle"] = create_action(rig, "idle", 144, [
        (1, {"root": {"loc": (0, 0, 0)}, "chest": {"rot": (0, 0, 0)}, "head": {"rot": (0, 0, -0.015)}, "tail.01": {"rot": (0, 0, -0.05)}, "tail.04": {"rot": (0, 0, 0.06)}}),
        (36, {"root": {"loc": (0, 0, 0.006)}, "chest": {"rot": (0.012, 0, 0)}, "head": {"rot": (0.018, 0, 0.015)}, "ear.L.01": {"rot": (0, 0.08, 0)}, "tail.01": {"rot": (0, 0, 0.03)}, "tail.04": {"rot": (0, 0, -0.04)}}),
        (72, {"root": {"loc": (0, 0, 0)}, "chest": {"rot": (0, 0, 0)}, "head": {"rot": (0, 0, -0.01)}, "ear.L.01": {"rot": (0, 0, 0)}, "tail.01": {"rot": (0, 0, 0.07)}, "tail.04": {"rot": (0, 0, -0.07)}}),
        (108, {"root": {"loc": (0, 0, 0.006)}, "chest": {"rot": (0.012, 0, 0)}, "head": {"rot": (-0.012, 0, 0.012)}, "ear.R.01": {"rot": (0, -0.08, 0)}, "tail.01": {"rot": (0, 0, 0.01)}, "tail.04": {"rot": (0, 0, 0.02)}}),
        (144, {"root": {"loc": (0, 0, 0)}, "chest": {"rot": (0, 0, 0)}, "head": {"rot": (0, 0, -0.015)}, "ear.R.01": {"rot": (0, 0, 0)}, "tail.01": {"rot": (0, 0, -0.05)}, "tail.04": {"rot": (0, 0, 0.06)}}),
    ])
    actions["listen"] = create_action(rig, "listen", 84, [
        (1, {"head": {"rot": (0, 0, 0)}, "ear.L.01": {"rot": (0, 0, 0)}, "ear.R.01": {"rot": (0, 0, 0)}}),
        (18, {"head": {"rot": (0.03, -0.07, 0.12)}, "neck.02": {"rot": (0.01, -0.04, 0.06)}, "ear.L.01": {"rot": (0, 0.20, -0.08)}, "ear.R.01": {"rot": (0, 0.12, 0.05)}}),
        (58, {"head": {"rot": (0.03, -0.07, 0.12)}, "neck.02": {"rot": (0.01, -0.04, 0.06)}, "ear.L.01": {"rot": (0, 0.15, -0.05)}, "ear.R.01": {"rot": (0, 0.20, 0.08)}}),
        (84, {"head": {"rot": (0, 0, 0)}, "neck.02": {"rot": (0, 0, 0)}, "ear.L.01": {"rot": (0, 0, 0)}, "ear.R.01": {"rot": (0, 0, 0)}}),
    ])
    actions["pet"] = create_action(rig, "pet", 72, [
        (1, {"root": {"loc": (0, 0, 0)}, "head": {"rot": (0, 0, 0)}}),
        (20, {"root": {"loc": (0, 0, 0.018)}, "chest": {"rot": (-0.025, 0, 0.02)}, "neck.02": {"rot": (-0.05, 0.02, -0.08)}, "head": {"rot": (-0.08, 0.02, -0.18)}, "tail.01": {"rot": (0, 0, 0.12)}, "tail.04": {"rot": (0, 0, -0.14)}}),
        (46, {"root": {"loc": (0, 0, 0.012)}, "head": {"rot": (-0.05, -0.02, 0.15)}, "tail.01": {"rot": (0, 0, -0.13)}, "tail.04": {"rot": (0, 0, 0.16)}}),
        (72, {"root": {"loc": (0, 0, 0)}, "chest": {"rot": (0, 0, 0)}, "neck.02": {"rot": (0, 0, 0)}, "head": {"rot": (0, 0, 0)}, "tail.01": {"rot": (0, 0, 0)}, "tail.04": {"rot": (0, 0, 0)}}),
    ])
    actions["feed"] = create_action(rig, "feed", 90, [
        (1, {"head": {"rot": (0, 0, 0)}, "neck.01": {"rot": (0, 0, 0)}}),
        (24, {"neck.01": {"rot": (0.26, 0, 0)}, "neck.02": {"rot": (0.24, 0, 0)}, "head": {"rot": (0.18, 0, 0)}, "front_upper.L": {"rot": (0, 0.02, 0)}, "front_upper.R": {"rot": (0, -0.02, 0)}}),
        (38, {"neck.01": {"rot": (0.28, 0, 0)}, "neck.02": {"rot": (0.25, 0, 0)}, "head": {"rot": (0.12, 0, -0.025)}, "jaw": {"rot": (-0.09, 0, 0)}}),
        (50, {"neck.01": {"rot": (0.28, 0, 0)}, "neck.02": {"rot": (0.25, 0, 0)}, "head": {"rot": (0.15, 0, 0.025)}, "jaw": {"rot": (0.02, 0, 0)}}),
        (62, {"neck.01": {"rot": (0.28, 0, 0)}, "neck.02": {"rot": (0.25, 0, 0)}, "head": {"rot": (0.12, 0, -0.02)}, "jaw": {"rot": (-0.08, 0, 0)}}),
        (90, {"neck.01": {"rot": (0, 0, 0)}, "neck.02": {"rot": (0, 0, 0)}, "head": {"rot": (0, 0, 0)}, "jaw": {"rot": (0, 0, 0)}, "front_upper.L": {"rot": (0, 0, 0)}, "front_upper.R": {"rot": (0, 0, 0)}}),
    ])
    actions["happy"] = create_action(rig, "happy", 66, [
        (1, {"root": {"loc": (0, 0, 0)}, "tail.01": {"rot": (0, 0, 0)}}),
        (14, {"root": {"loc": (0, -0.015, -0.025)}, "chest": {"rot": (0.12, 0, 0)}, "head": {"rot": (-0.08, 0, 0)}, "tail.01": {"rot": (-0.18, 0, 0.18)}, "tail.04": {"rot": (-0.12, 0, -0.20)}}),
        (28, {"root": {"loc": (0, 0, 0.085)}, "chest": {"rot": (-0.08, 0, 0)}, "head": {"rot": (0.04, 0, -0.08)}, "tail.01": {"rot": (-0.20, 0, -0.20)}, "tail.04": {"rot": (-0.12, 0, 0.22)}}),
        (42, {"root": {"loc": (0, 0, 0.018)}, "head": {"rot": (0, 0, 0.08)}, "tail.01": {"rot": (-0.18, 0, 0.16)}, "tail.04": {"rot": (-0.12, 0, -0.18)}}),
        (66, {"root": {"loc": (0, 0, 0)}, "chest": {"rot": (0, 0, 0)}, "head": {"rot": (0, 0, 0)}, "tail.01": {"rot": (0, 0, 0)}, "tail.04": {"rot": (0, 0, 0)}}),
    ])
    actions["quiet"] = create_action(rig, "quiet", 156, [
        (1, {"root": {"loc": (0, 0, -0.012)}, "head": {"rot": (0.04, 0, 0)}, "tail.01": {"rot": (0.15, 0, 0)}}),
        (78, {"root": {"loc": (0, 0, -0.006)}, "chest": {"rot": (0.008, 0, 0)}, "head": {"rot": (0.055, 0, 0.025)}, "ear.L.01": {"rot": (0, -0.07, 0)}, "tail.01": {"rot": (0.18, 0, 0.025)}}),
        (156, {"root": {"loc": (0, 0, -0.012)}, "chest": {"rot": (0, 0, 0)}, "head": {"rot": (0.04, 0, 0)}, "ear.L.01": {"rot": (0, 0, 0)}, "tail.01": {"rot": (0.15, 0, 0)}}),
    ])
    actions["sad"] = create_action(rig, "sad", 174, [
        (1, {"root": {"loc": (0, 0, -0.035)}, "spine.02": {"rot": (0.05, 0, 0)}, "neck.01": {"rot": (0.10, 0, 0)}, "head": {"rot": (0.09, 0, 0)}, "ear.L.01": {"rot": (0, -0.18, 0)}, "ear.R.01": {"rot": (0, 0.18, 0)}, "tail.01": {"rot": (0.30, 0, 0)}}),
        (87, {"root": {"loc": (0, 0, -0.029)}, "chest": {"rot": (0.008, 0, 0)}, "neck.01": {"rot": (0.11, 0, 0)}, "head": {"rot": (0.11, 0, -0.018)}, "ear.L.01": {"rot": (0, -0.22, 0)}, "ear.R.01": {"rot": (0, 0.16, 0)}, "tail.01": {"rot": (0.32, 0, 0)}}),
        (174, {"root": {"loc": (0, 0, -0.035)}, "chest": {"rot": (0, 0, 0)}, "spine.02": {"rot": (0.05, 0, 0)}, "neck.01": {"rot": (0.10, 0, 0)}, "head": {"rot": (0.09, 0, 0)}, "ear.L.01": {"rot": (0, -0.18, 0)}, "ear.R.01": {"rot": (0, 0.18, 0)}, "tail.01": {"rot": (0.30, 0, 0)}}),
    ])
    actions["withdrawn"] = create_action(rig, "withdrawn", 192, [
        (1, {"root": {"loc": (0, 0, -0.055)}, "pelvis": {"rot": (0.06, 0, 0)}, "spine.01": {"rot": (0.05, 0, 0)}, "neck.01": {"rot": (0.20, 0, 0)}, "neck.02": {"rot": (0.17, 0, 0)}, "head": {"rot": (0.15, 0, 0)}, "tail.01": {"rot": (0.08, 0, 0.04)}, "tail.03": {"rot": (0.03, 0, 0.05)}, "ear.L.01": {"rot": (0, -0.24, 0)}, "ear.R.01": {"rot": (0, 0.24, 0)}}),
        (96, {"root": {"loc": (0, 0, -0.049)}, "pelvis": {"rot": (0.06, 0, 0)}, "spine.01": {"rot": (0.05, 0, 0)}, "chest": {"rot": (0.008, 0, 0)}, "neck.01": {"rot": (0.20, 0, 0)}, "neck.02": {"rot": (0.17, 0, 0)}, "head": {"rot": (0.16, 0, -0.012)}, "tail.01": {"rot": (0.08, 0, 0.04)}, "tail.03": {"rot": (0.03, 0, 0.05)}, "ear.L.01": {"rot": (0, -0.24, 0)}, "ear.R.01": {"rot": (0, 0.24, 0)}}),
        (192, {"root": {"loc": (0, 0, -0.055)}, "pelvis": {"rot": (0.06, 0, 0)}, "spine.01": {"rot": (0.05, 0, 0)}, "chest": {"rot": (0, 0, 0)}, "neck.01": {"rot": (0.20, 0, 0)}, "neck.02": {"rot": (0.17, 0, 0)}, "head": {"rot": (0.15, 0, 0)}, "tail.01": {"rot": (0.08, 0, 0.04)}, "tail.03": {"rot": (0.03, 0, 0.05)}, "ear.L.01": {"rot": (0, -0.24, 0)}, "ear.R.01": {"rot": (0, 0.24, 0)}}),
    ])
    return actions


def configure_render():
    world = bpy.data.worlds.new("CompanionWorld")
    bpy.context.scene.world = world
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.018, 0.022, 0.03, 1)
    world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.32

    for name, kind, location, energy, size, color in (
        ("WarmKey", "AREA", (2.6, -3.5, 4.2), 1450, 4.0, (1.0, 0.72, 0.5)),
        ("AmberRim", "AREA", (-3.5, 1.5, 2.4), 900, 3.0, (1.0, 0.28, 0.08)),
        ("CoolFront", "AREA", (0.4, -4.2, 2.0), 850, 5.0, (0.50, 0.62, 1.0)),
    ):
        bpy.ops.object.light_add(type=kind, location=location)
        light = bpy.context.object
        light.name = name
        light.data.energy = energy
        light.data.shape = "DISK"
        light.data.size = size
        light.data.color = color

    bpy.ops.object.camera_add(location=(3.3, -3.0, 1.2))
    camera = bpy.context.object
    camera.name = "CompanionCamera"
    camera.data.lens = 68
    camera.rotation_euler = (Vector((0, 0.43, 0.82)) - camera.location).to_track_quat("-Z", "Y").to_euler()
    bpy.context.scene.camera = camera

    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = 256
    scene.render.resolution_y = 256
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.film_transparent = True
    scene.view_settings.look = "AgX - Medium High Contrast"
    scene.render.fps = FPS


def render_actions(rig, actions):
    scene = bpy.context.scene
    for name, action in actions.items():
        output = FRAME_ROOT / name
        output.mkdir(parents=True, exist_ok=True)
        for stale in output.glob("*.png"):
            stale.unlink()
        rig.animation_data.action = action
        frame_numbers = list(range(1, int(action.frame_end) + 1, SAMPLE_STEP))
        if frame_numbers[-1] != int(action.frame_end):
            frame_numbers.append(int(action.frame_end))
        for sequence, frame in enumerate(frame_numbers):
            scene.frame_set(frame)
            scene.render.filepath = str(output / f"{sequence:03d}.png")
            bpy.ops.render.render(write_still=True)
        print(f"Rendered {name}: {len(frame_numbers)} frames")


def main():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.fbx(filepath=str(SOURCE))
    mesh = next(obj for obj in bpy.context.scene.objects if obj.type == "MESH")
    mesh.name = "ShadowFoxCompanion"
    bpy.context.view_layer.objects.active = mesh
    mesh.select_set(True)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    assign_materials(mesh)

    rig = create_armature()
    skin_mesh(mesh, rig)
    rig.animation_data_create()
    actions = build_actions(rig)
    configure_render()

    DERIVED_BLEND.parent.mkdir(parents=True, exist_ok=True)
    rig.animation_data.action = actions["idle"]
    bpy.context.scene.frame_set(1)
    bpy.ops.wm.save_as_mainfile(filepath=str(DERIVED_BLEND))
    render_actions(rig, actions)

    print(f"Rig complete: {len(rig.data.bones)} bones, {len(actions)} actions, {len(mesh.data.vertices)} weighted vertices")
    print(f"Saved: {DERIVED_BLEND}")


if __name__ == "__main__":
    main()
