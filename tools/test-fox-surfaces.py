"""Regression checks for the seams reported in the layer motion preview."""
import importlib.util
import json
from pathlib import Path
import unittest
from PIL import Image, ImageChops, ImageFilter

spec=importlib.util.spec_from_file_location("fox",Path(__file__).with_name("build-fox-layer-prototype.py"))
fox=importlib.util.module_from_spec(spec)
spec.loader.exec_module(fox)


class SurfaceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.layers={p.stem:Image.open(p).convert("RGBA") for p in (fox.OUT/"layers").glob("*.png")}
        cls.poses=json.loads((fox.SOURCE_DIR/"reference-chain-v1.motion.json").read_text())["frames"]
        cls.pivots={p["id"]:p["pivot"] for p in json.loads((fox.OUT/"rig.json").read_text())["layers"]}
        cls.body=fox.combine(cls.layers,("body","chest","front-legs"))
        cls.head=fox.combine(cls.layers,("head","ear-left","ear-right","eye-near","eye-far","muzzle"))

    def test_head_has_no_duplicate_joint_patches(self):
        source=fox.place(Image.open(fox.OUT/"parts/head-neutral.png").convert("RGBA"),116,(100,23))
        self.assertEqual(self.head.tobytes(),source.tobytes())

    def test_paws_remain_pinned_for_entire_cycle(self):
        expected=self.body.crop((0,215,256,256)).tobytes()
        for f in self.poses:
            warped=fox.mesh_warp(self.body,fox.body_inverse(f["pose"]))
            self.assertEqual(warped.crop((0,220,256,256)).getchannel("A").tobytes(),self.body.crop((0,220,256,256)).getchannel("A").tobytes(),f["frame"])

    def test_no_transparent_cracks_inside_head_or_body(self):
        for surface,mapper in ((self.body,fox.body_inverse),(self.head,lambda p:fox.head_inverse(p,self.pivots))):
            # Test opaque interior, excluding intentional silhouette transparency.
            interior=surface.getchannel("A").point(lambda p:255 if p==255 else 0).filter(ImageFilter.MinFilter(7))
            mask=Image.new("RGBA",(256,256),(255,255,255,255));mask.putalpha(interior)
            for f in self.poses:
                inv=mapper(f["pose"])
                region=fox.mesh_warp(mask,inv).getchannel("A").point(lambda p:255 if p==255 else 0)
                actual=fox.mesh_warp(surface,inv).getchannel("A")
                holes=ImageChops.multiply(region,actual.point(lambda p:255 if p<250 else 0))
                self.assertIsNone(holes.getbbox(),f["frame"])

    def test_expression_changes_without_changing_canvas(self):
        neutral=fox.facial_surface(self.head,self.poses[0]["pose"])
        blink=fox.facial_surface(self.head,self.poses[20]["pose"])
        happy=fox.facial_surface(self.head,self.poses[60]["pose"])
        self.assertNotEqual(neutral.tobytes(),blink.tobytes())
        self.assertNotEqual(neutral.tobytes(),happy.tobytes())
        self.assertEqual(neutral.size,blink.size)
        self.assertEqual(neutral.size,happy.size)


if __name__=="__main__":
    unittest.main()

