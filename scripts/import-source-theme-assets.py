#!/usr/bin/env python3
"""Copy byte-identical original theme artwork from a checked-out legacy-win7.

This is an explicit, verified source import, NOT generated replacement artwork.
The pinned source repository is codersachin99/legacy-win7 at
26b9f0ce7a1665dee89a7c81824bec09e2c75776.

Examples:
  python scripts/import-source-theme-assets.py --source ../legacy-win7 --verify-only
  python scripts/import-source-theme-assets.py --source ../legacy-win7 --themes winxp
  python scripts/import-source-theme-assets.py --source ../legacy-win7
"""
from __future__ import annotations

import argparse
import hashlib
from pathlib import Path

LEGACY_SHA = "26b9f0ce7a1665dee89a7c81824bec09e2c75776"
# Git blob SHA from the pinned original repository's recursive tree.
FILES: dict[str, dict[str, str]] = {
    "boot": {
        "boot-win31.7bac4ac4.webp": "45c51183da1be81aed459cce5b499e2137bd9f29",
        "boot-win95.9bf06d7a.gif": "c8ef1f453edb0e25a9bb8d1cb7f802716e2c3384",
        "boot-win98.36ae413e.gif": "92bbf71f5a62d394d9d2b29db5dcecf2db955961",
        "boot-win2k.2870262d.gif": "6355fd992e8d60c19612df37e8e499d063f7a76e",
        "boot-winxp.c42ee019.gif": "91d8eda88f2c022cedceb94e056c25b396e1ed45",
        "boot-winvista.f7526b81.gif": "1c18b94eef48368ea02a6cefe77bb3186b82ea48",
        "boot-win8.1a6acdfd.webp": "70a378a2198fb25ab23f4007a89b90e0f11e0aae",
        "boot-win11.120bb3b3.webp": "f92ad078c0fa36ad8347fb582511fe36745b654a",
        "boot-winL.934ea74a.gif": "e5fa6198492b9065dcd58e07ac975dd41a9ce670",
        "boot-winW.052f504e.webp": "3f27d7236654d969a99c3300b283a27973e0c156",
    },
    "win7": {
        "personal.ccbfdd3a.webp": "1c1649d47ab3c405afb49ce2fa45e3a9cd937725",
        # Original startmenu-base.js "start-docs/pics/music" artwork.
        # Non-Basic right-pane hovered icon and Basic source vector variants.
        "start-docs.68e567fd.webp": "a82934c9371838320975f1c909bb2f4389a1c079",
        "start-pics.90cdea88.webp": "5285250096ad9a789020a51f6b00a08548205465",
        "start-music.7d1b9e60.webp": "b0a08bc345b84669b8d16505b85bdb88508c2d65",
        "start-docs-base.d4ace145.svg": "fe868511c13fdb1c4c10e16d3784b1f3bf6e0b60",
        "start-pics-base.b5f2d859.svg": "0567f7ac8f8483e8e0857dda99bf2685d97acd4e",
        "start-music-base.74611945.svg": "0670bea5472a2c9169fba7f269028656922489ef",
    },
    "win2k": {
        "logo2k.15140c8b.webp": "028a0e1cd4f9eab7c472482312189eeecd0fc0df",
    },
    "winLS": {
        # logon-winl.js uses this for both source aliases winLS and winLP.
        "login-winL.d27b081a.webp": "fd22904131ad5ddb4ab5c316edbe9eb19aa01376",
    },
    "winW": {
        # logon-winw.js source misc.logowhistler verified from pinned Git blob.
        "logowhistler.73c9045c.webp": "c0528d4a30f97f83400939ae891bc2ae54d863bb",
    },
    "winvista": {
        "login-winvista.7a523d62.webp": "88fbd430ea5cb10893cb89092c562528ed779464",
        "shutdown.08d3f74a.webp": "6a4478b1e3c9319030f42a09a6aaf79fe0dbef3e",
    },
    "macos": {
        "macos.54af5cd4.webp": "a2ef4cea31559d755388afd5e6e5207659d07646",
        "guest-macos.caf967b3.webp": "0ffc437084814b13509a2e31353ab4b1e33b8f22",
    },
    "chromeos": {
        "chromeos.eaca6e72.webp": "eca88c4b8ba39d9787fa9c52092ea607c89edfd9",
        "usertile12.75a9eb89.webp": "63281c3cc0cf7b5acf125419feacb958aa22a6fe",
    },
    "ubuntu": {
        "guest-ubuntu.e2037acf.svg": "496b816c138dd8c57f9007437798cf4b1516b509",
        "logo-ubuntu.b06d4c47.svg": "a1f643846d1a2b1d95de2ea7b589ae451dd8f92e",
    },
    "kubuntu": {
        "kubuntu.618268f7.webp": "78bd1d5c479b065a613f3425ea54129a9a0d7e70",
    },
    "oxygen": {
        "oxygen.414aed47.svg": "0c19a29a1499e0b42d172f9e7517fd85d4710793",
        "restart-oxygen.d4450a1a.webp": "649a96ea0f18963bb536b2e9ee9693d5ff9b958c",
        "shutdown-oxygen.62df7a25.webp": "408a3db796a44c99d0baad29d65c690e061acf04",
    },
    "aeroNoir": {
        "aeroNoir.237e6377.webp": "6ae97abb795a245c647df7f2747eba01c2d46f75",
        "restart-kubuntu.5c766c73.svg": "e689418c3ff37bab7eab8605e98ae4472a6da1ad",
        "shutdown-kubuntu.146c3ea3.svg": "26b83d0f3c1f88aebb691fd363544c57f1fc50af",
    },
    "winxp": {
        "logoxp.9b034658.png": "33b3bca96d3c07994b096bf13d2a87a6a05b1196",
        "action-center-winxp.52f44912.webp": "56cc03e77b7ce0097db3addd9463d0d8b22c502f",
        "network-winxp.744648d4.webp": "17a20ab4a2949d8d146c61eef931f741eb714d89",
        "battery-winxp.af8edd8a.webp": "bcb8e090d5fbac02dd8fdb707903c124d479a349",
        "datetime-winxp.d62f4ef6.webp": "67745543f884f62c379708cbd6bc647fe9ab5e94",
        "camera-winxp.b21fe0fe.webp": "f81802b9facc12408511a6b36ce441d8e660c5f1",
        "magnifier-winxp.24194bc4.webp": "90a6126fb40d3cf8a4809b5cb2336a33c40723e1",
        "paint-winxp.7e4e5dac.webp": "1b4d283a4f8377c0349e1656b50d38c8560cbcc0",
        "player-winxp.e1b486dd.webp": "2d6af1ed5ba6ed8bc8d58f71d7ad6f5ce6815fb2",
        "run-winxp.63d23fb9.webp": "c949937d5b8263691eb423de23f4341bb66f178d",
        "display-winxp.da9a9b48.webp": "7fd089abb7ae37270d40da92fcf97e70af1eaef5",
        "programs-winxp.f148b05d.webp": "184bc6e9b6d1b60a070aae6b22e4a1bcb4742cc1",
        "personal-winxp.01949b73.webp": "ff15843e4c66d74e3df93ea6f65230786c197d0c",
        "taskbar-winxp.46a225c9.webp": "5773da73c5d276a7429918a818181b428927bfe9",
        "wordpad-winxp.1bde3c38.webp": "f6ea4b4f2e6602363bff5de70617d4f907cc2433",
        "text-winxp.35e970dd.webp": "69ac9cf8cba1b058125a2062ef2e27840bccb273",
        "executable-winxp.b1d9ded4.webp": "3031101d0001c60ec632d198afd2dd179dc39470",
        "media-winxp.c7e33e88.webp": "e45eaedc4616cb4ef9bdf8cf5556a717377aad2f",
        "folder-docs-winxp.a303ce2a.webp": "3d1ffa56dd59cd6f092f3a9bb743f4cdbbc72ac7",
        "folder-pics-winxp.05398ea9.webp": "59276ab8a94f6a8a3178b43bfdbb17fed9ee6b80",
        "folder-music-winxp.dc009194.webp": "af4a673024f8442c47a966b0000aa682ba2a04f1",
        "folder-videos-winxp.c38aba27.webp": "ee1559c74a6f6a2b1ce195960e862924cf5325a2",
        "disk-os-winxp.e3c2a016.webp": "c360c557cef719e163b9f2a89ac24f52d9698367",
        "disk-cd-winxp.83ac2166.webp": "39a607c83f897540c13fe661bb57b5241d8aa247",
        "disk-data-winxp.225dcc03.webp": "7a480bb1a9ccaac76f8454c8736af2752fbe1176",
        "default-winxp.4351048b.webp": "7dc8ff6692ee5053d35fce6ce9982c52d798fed5",
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
    "win8": {
        "guest-win8.265e68f5.webp": "060bcb7d2327f85c3f51bc33d2704072e86df578",
        "win8-startscreen.844bc8df.webp": "018e7ce006174771f2bf24e4a18c77596cf26b01",
        "win8.3a5f11f3.webp": "02d9561be738dca78f8af8f67b2cbccf0390c48c",
        "win81.7b80787e.webp": "e2b46add76737836683dfe48fb13532615acc2b7",
    },
    "win10": {
        "win10.743e8c13.webp": "988278e48d41f10f2f701c748d73595f700b75c0",
        "start-button-win8.2e5214cc.svg": "4fee2569b36836b595b0f13d429ad4ed967127af",
        "computer-win10.2212df79.webp": "0e57037ee2ec589556c6a0ab80509c7c979666cd",
        "bin-win10.e0f739cc.webp": "4a68a6a3958748018640f1b9cd7fc9b55137d098",
        "bin-full-win10.857c2cab.webp": "6b9a1f6d1b3fede8661f201e940cc881db6bed09",
        "folder-win10.294665f0.webp": "096e033bf55aaf5a8c98472d21fbd8d4c748acf0",
        "file-win10.036601ed.webp": "cd0a20cbb1099f61e7028a1c315b585d616208f6",
        "cpanel-win10.d3d1d446.webp": "a960a2939446c2ef6901dc9acdca55ddfcfdbaf6",
        "games-win10.63f82076.webp": "05104c19549b3579db2eb3f31b1b9af5bb4d7377",
    },
    "win11dark": {
        "start-button-win11dark.d417814c.webp": "13187c97beb8af8f2b0b3a7ccda25b0925868a42",
        "win11dark.af52a1ca.webp": "18ec99e80efb302bcdd01e86d31954daaa706b8d",
    },
    "win11": {
        "guest-win10.a110df5a.webp": "57caee256e62a46271db867a088f49b1981bbc7d",
        "personal-win11.76af8a1e.webp": "758c1959c286e169051e211b680ae26fb959bc95",
        "paint-win11.ea557c33.webp": "d3d4f5425084975325c92ffd67ef31fdf11a2059",
        "text-win11.d9d08eae.webp": "bf37ae9cea570e36831fa33fca9f494aec53ede0",
        "executable-win11.2b4d4283.webp": "75c863e243f2e38bf1ca158a774073a14ad3231b",
        "media-win11.a4cd83eb.webp": "85a5d0afcb3544f627856ca31d3777d30df26afe",
        "folder-docs-win11.18b5729b.webp": "b06ea1e868e6a49f5002f38fa9608e9237c627b5",
        "folder-pics-win11.76e995dc.webp": "a81f9c97365043884d9d48a85462756363011aa3",
        "folder-downloads-win11.f675795b.webp": "e6a12cd135ace886fe91d1676631c0af6fef42f6",
        "disk-os-win11.4aee0d0a.webp": "f6fa806310f0009f2b744a62aa6975924004aeed",
        "disk-cd-win11.84d9e496.webp": "945a0663e3a8aaa5ec93f5a89dd8a9cff02da822",
        "disk-data-win11.a389fbb1.webp": "faed93fc5a79ddedcc58f773d8464940c0d3a68a",
        "default-win11.fdf9b988.webp": "ed90b9589733379c0bb99e2b3a5d44bdf433dc8a",
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


def verify_target_files(target: Path, themes: tuple[str, ...]) -> int:
    """Verify *committed target* bytes against the pinned original Git blobs.

    Unlike source-import mode, this works in a clean CI checkout without
    the legacy repository or a private source access token.
    """
    count = 0
    for theme in themes:
        for name, expected in FILES[theme].items():
            path = target / name
            if not path.is_file():
                raise FileNotFoundError(f"Missing original theme asset: {path}")
            actual = git_blob_sha(path.read_bytes())
            if actual != expected:
                raise ValueError(
                    f"Modified original theme asset {name}: {actual}, expected {expected}"
                )
            count += 1
    return count


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    project = Path(__file__).resolve().parents[1]
    parser.add_argument("--source", type=Path, default=project.parent / "legacy-win7")
    parser.add_argument("--target", type=Path,
                        default=project / "apps/web/public/assets/images")
    parser.add_argument("--themes", choices=["boot", "win7", "win2k", "winxp", "win8", "win10", "win11"], nargs="+",
                        default=["boot", "win7", "win2k", "winxp", "win8", "win10", "win11"])
    parser.add_argument("--verify-only", action="store_true")
    parser.add_argument("--verify-target-only", action="store_true",
                        help="Check committed target bytes without source checkout")
    args = parser.parse_args()
    if args.verify_target_only:
        count = verify_target_files(
            args.target.resolve(), tuple(dict.fromkeys(args.themes))
        )
        print(f"Verified {count} exact pinned theme Git blobs in target checkout.")
        return
    count, copied = import_files(
        args.source.resolve(), args.target.resolve(), tuple(dict.fromkeys(args.themes)),
        args.verify_only
    )
    print(f"Verified {count} pinned source blobs; copied {copied}. "
          "No generated replacements or altered bytes.")


if __name__ == "__main__":
    main()
