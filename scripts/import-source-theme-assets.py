#!/usr/bin/env python3
"""Copy byte-identical XP/Win11 theme artwork from a checked-out legacy-win7.

This is an explicit, verified source import, NOT generated replacement artwork.
The pinned source repository is codersachin99/legacy-win7 at
4e63290d783009e1293433c6ccf252abba9c1187.

Examples:
  python scripts/import-source-theme-assets.py --source ../legacy-win7 --verify-only
  python scripts/import-source-theme-assets.py --source ../legacy-win7 --themes winxp
  python scripts/import-source-theme-assets.py --source ../legacy-win7
"""
from __future__ import annotations

import argparse
import hashlib
from pathlib import Path

LEGACY_SHA = "4e63290d783009e1293433c6ccf252abba9c1187"
# Git blob SHA from the pinned original repository's recursive tree.
FILES: dict[str, dict[str, str]] = {
    "winxp": {
        "notepad-winxp.82037fb1.webp": "0a1d5d150fab025ed264212c213abc1d001b8450",
        "games-winxp.7f048588.webp": "6208de3f4b06b387cd338d53f7d933e56b1f1303",
        "cpanel-winxp.1b08f5c8.webp": "a4ff8ce54a41ae32af097c1c3b0f7dc769c671e9",
        "calc-winxp.f79aee6b.webp": "20b7bff157662612fc19e05d6cc0e5486776a3f6",
        "cmd-winxp.62e75899.webp": "7531295043ea9a9b18b22a5443e0e07f780afa9b",
        "start-button-winxp.a3485adf.webp": "fe20544f4aa319b1019bdd4f177630a0c4d680d2",
        "bin-winxp.7d0403fd.webp": "46c95fdb19ff038c8c733982c5df04322659dcce",
        "bin-full-winxp.ba3f6193.webp": "e4760bd7367997e2512aa00e07436a172f8574b4",
        "computer-winxp.8cbae9da.webp": "e9f50f48d4a6529e6419ab6e711cd5d1c3fe74cc",
        "folder-winxp.ff1b00c5.webp": "43766e1cc9cf7c9c0470d7df76eb9b67d7177dff",
        "file-winxp.c130b357.webp": "a5ca3121548c50a51cdf28fff9170d16db2355ee",
        "winxp.3e41719f.webp": "3cd2270ba3cefc02b1e7e2f2ef5fd7e10df549da",
        "logoff-winxp.71dc5ab2.webp": "95046c4af328fdf2e3380d19d21174d5ff4e4afa",
        "shutdown-winxp.f3312ea0.webp": "26ffb2c4eb3e05ad056edf14111bac54d2f46007",
    },
    "win11": {
        "notepad-win11.2e4af294.webp": "55fdede37d9b89dec6d71325066eded54b404ce9",
        "games-win11.d339e9be.webp": "d0a99d6867a8781711ad581f3e9f8ec3ddfc10fd",
        "cpanel-win11.e7111666.webp": "eb550ab6dfa69343eab2180cb1ca7c66dc6bd6a8",
        "photo-win11.bb63ad2e.webp": "e9da2bd74504bc1387dedfb27bf14088233ba741",
        "cmd-win11.ecbe89c7.webp": "d84f8f4e59a15ccb3baa70d9895b13415966a0d6",
        "start-button-win11.e48a735f.webp": "c6249d4c405516bbd49e437145a1df5874cf483e",
        "bin-win11.73608517.webp": "6473d922271876f980454cb842fb96a8c3956acf",
        "bin-full-win11.de576bf3.webp": "d5c2c4b41ed49a729d4ff40f7dc3951516d9b2e8",
        "computer-win11.fc5b48e4.webp": "9d40da8deb7e1bea560519aab5955ccae74edeec",
        "folder-win11.49360b7d.webp": "565e6998c2e5b189cb81ae0eb92dc3501310a111",
        "file-win11.8b2c3723.webp": "5af256855a2f21dc0d446b8d1046ea00b2a9cdcc",
        "win11.fc00c43d.webp": "afdeb605cc0012d129ceba4bfdc7351f66a5c8f5",
    },
}


def git_blob_sha(data: bytes) -> str:
    return hashlib.sha1(b"blob " + str(len(data)).encode("ascii") + b"\0" + data).hexdigest()


def import_files(
    source: Path, target: Path, themes: tuple[str, ...], verify_only: bool
) -> tuple[int, int]:
    required = [(name, sha) for theme in themes for name, sha in FILES[theme].items()]
    # Validate every source byte before writing even one file.
    verified: list[tuple[str, bytes, str]] = []
    for name, expected in required:
        path = source / "assets/images" / name
        if not path.is_file():
            raise FileNotFoundError(f"Missing original source artwork: {path}")
        data = path.read_bytes()
        actual = git_blob_sha(data)
        if actual != expected:
            raise ValueError(f"Incorrect source SHA for {name}: {actual}, expected {expected}")
        verified.append((name, data, expected))
    copied = 0
    for name, data, sha in verified:
        path = target / name
        if path.exists():
            previous = git_blob_sha(path.read_bytes())
            if previous != sha:
                raise ValueError(f"Refusing to overwrite differing target artwork: {path}")
            print(f"VERIFIED {name} {sha}")
        elif verify_only:
            print(f"SOURCE-VERIFIED (pending import) {name} {sha}")
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(data)
            copied += 1
            print(f"COPIED {name} {sha}")
    return len(verified), copied


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    project = Path(__file__).resolve().parents[1]
    parser.add_argument("--source", type=Path, default=project.parent / "legacy-win7")
    parser.add_argument("--target", type=Path,
                        default=project / "apps/web/public/assets/images")
    parser.add_argument("--themes", choices=["winxp", "win11"], nargs="+",
                        default=["winxp", "win11"])
    parser.add_argument("--verify-only", action="store_true")
    args = parser.parse_args()
    count, copied = import_files(
        args.source.resolve(), args.target.resolve(), tuple(dict.fromkeys(args.themes)),
        args.verify_only
    )
    print(f"Verified {count} pinned source blobs; copied {copied}. "
          "No generated replacements or altered bytes.")


if __name__ == "__main__":
    main()
