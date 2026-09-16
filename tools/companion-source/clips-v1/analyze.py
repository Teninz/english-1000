import json, sys
from pathlib import Path
import numpy as np
from PIL import Image

HERE = Path(__file__).parent
res = {}
for d in sorted(HERE.iterdir()):
    if not (d / "frames").is_dir(): continue
    files = sorted((d / "frames").glob("*.png"))
    fr = np.stack([np.asarray(Image.open(f).convert("RGB")) for f in files]).astype(np.int16)
    n = len(fr)
    def border(f):
        e = np.concatenate([f[:6].reshape(-1,3), f[-6:].reshape(-1,3), f[:, :6].reshape(-1,3), f[:, -6:].reshape(-1,3)])
        return np.median(e, axis=0)
    bc = np.array([border(f) for f in fr])
    green = (bc[:,1] > bc[:,0] + 25) & (bc[:,1] > bc[:,2] + 25)
    step = np.array([0] + [np.abs(fr[i]-fr[i-1]).mean() for i in range(1, n)])
    # start: first green frame followed by 5 green frames with small steps
    start = None
    for i in range(n-6):
        if (step[i+1:i+6] < 4).all() and np.abs(bc[i] - bc[-1]).max() < 40:
            start = i; break
    # background stability: border std over stable range
    bcs = bc[start:] if start is not None else bc
    # loop search: small downsampled frames
    small = np.stack([np.asarray(Image.fromarray(f.astype(np.uint8)).resize((106,159))) for f in fr]).astype(np.int16)
    best = None
    minlen = 36
    if start is not None:
        for i in range(start, n - minlen):
            for j in range(i + minlen, n):
                dd = np.abs(small[i]-small[j]).mean()
                if best is None or dd < best[0]:
                    best = (round(float(dd),2), i, j)
    res[d.name] = {
        "frames": n, "start": start,
        "bg_first_stable": [int(x) for x in bc[start]] if start is not None else None,
        "bg_last": [int(x) for x in bc[-1]],
        "bg_drift_max": float(np.abs(bcs - bcs[0]).max()) if start is not None else None,
        "best_loop": best,
        "first_stable_vs_last": round(float(np.abs(small[start]-small[-1]).mean()),2) if start is not None else None,
        "max_step_after_start": round(float(step[start+1:].max()),2) if start is not None else None,
    }
    print(d.name, json.dumps(res[d.name]))
(HERE / "analysis.json").write_text(json.dumps(res, indent=2))
