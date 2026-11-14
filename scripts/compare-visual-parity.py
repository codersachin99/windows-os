#!/usr/bin/env python3
"""Generate REVIEW-ONLY side-by-side and diff evidence for matched visual captures.

Does not turn a pixel score into an acceptance or parity claim.
Requires Pillow; run only when a real pinned legacy baseline was captured.
"""
import argparse
import json
from pathlib import Path
from PIL import Image, ImageChops, ImageEnhance


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", default="artifacts/visual-parity")
    args = parser.parse_args()
    root = Path(args.root).resolve()
    manifest = json.loads((root / "manifest.json").read_text(encoding="utf-8"))
    if not manifest.get("sourceConfigured"):
        raise SystemExit("No legacy source configured; cannot produce paired visual comparisons")
    records = {
        (item["implementation"], item["profile"], item["scene"]): item
        for item in manifest["captures"]
    }
    report = {
        "sourceReferenceSha": manifest["sourceReferenceSha"],
        "sourceRevisionClaimed": manifest.get("sourceRevisionClaimed"),
        "targetRevision": manifest["targetRevision"],
        "parityStatus": "requires-human-review",
        "comparisonEligibleScenes": manifest.get("sharedSceneNames", []),
        "targetOnlyScenes": manifest.get("targetOnlySceneNames", []),
        "targetOnlyNotCompared": [
            {"profile": record["profile"], "scene": record["scene"], "file": record["file"]}
            for record in manifest["captures"]
            if record["implementation"] == "target"
            and not record.get("sourceComparisonEligible", True)
        ],
        "comparisons": [],
    }
    out = root / "diffs"
    out.mkdir(parents=True, exist_ok=True)

    for profile in ("desktop", "mobile"):
        for scene in ("guest-desktop", "computer-root", "computer-organize", "computer-view", "recycle-bin"):
            source = records.get(("source", profile, scene))
            target = records.get(("target", profile, scene))
            item = {"profile": profile, "scene": scene, "status": "unpaired"}
            report["comparisons"].append(item)
            if not source or not target or source["status"] != "captured" or target["status"] != "captured":
                continue
            with Image.open(root / source["file"]) as original, Image.open(root / target["file"]) as current:
                original = original.convert("RGB")
                current = current.convert("RGB")
                item["sourceDimensions"] = list(original.size)
                item["targetDimensions"] = list(current.size)
                if original.size != current.size:
                    item["status"] = "dimension-mismatch"
                    continue
                difference = ImageChops.difference(original, current)
                threshold = difference.convert("L").point(lambda pixel: 255 if pixel > 20 else 0)
                changed = sum(1 for pixel in threshold.getdata() if pixel != 0)
                item["changedPixelsOverThreshold"] = changed
                item["changedPixelsPercent"] = round(100 * changed / (original.width * original.height), 4)
                item["differenceBoundingBox"] = list(threshold.getbbox()) if threshold.getbbox() else None
                prefix = profile + "-" + scene
                difference = ImageEnhance.Contrast(difference).enhance(3.0)
                difference.save(out / (prefix + "-diff.png"))
                Image.blend(original, current, 0.5).save(out / (prefix + "-overlay.png"))
                item["status"] = "captured-requires-human-review"
                item["diff"] = "diffs/" + prefix + "-diff.png"
                item["overlay"] = "diffs/" + prefix + "-overlay.png"

    (root / "comparison-report.json").write_text(
        json.dumps(report, indent=2) + "\n", encoding="utf-8"
    )
    compared = sum(item["status"] == "captured-requires-human-review" for item in report["comparisons"])
    missing = sum(item["status"] != "captured-requires-human-review" for item in report["comparisons"])
    print(json.dumps({"compared": compared, "unpairedOrMismatched": missing,
                      "targetOnlyNotCompared": len(report["targetOnlyNotCompared"]),
                      "parityStatus": report["parityStatus"]}))
    if missing:
        raise SystemExit("Paired capture is incomplete; see comparison-report.json")


if __name__ == "__main__":
    main()
