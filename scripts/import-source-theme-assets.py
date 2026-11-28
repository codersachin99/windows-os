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
    "taskbar-popup": {
        "pin.356eaf87.webp": "60b65c5608cb76650c53ceac52a08da071318cb8",
        "close.15c502bb.webp": "e1a9ad1ca2072705748533675abad78984264cbf",
        "pin-onebit.d565a303.svg": "34b026ad8a1395053a0159c8014d838981102b55",
        "close-onebit.a1490e2c.svg": "e443506cb38041175865aa8137f87f0fd7a0db42",
    },
    "desktop-defaults": {
        "autumn.41774694.webp": "c26ab7b1be0c6532ab1e7a84a90d713ed9d4f79d",
        "follows.3e030a12.webp": "125a6c75c12dcb47054eada034328c5d11c9aaa7",
        "azul.3af33f73.webp": "dfc568bad42969b77034573e31b6c6cbafa5a84f",
        "ascent.7c62e722.webp": "ba6303a12c3eb5eff1e0e68379c481d4801d4e70",
        "ubuntu.3588c6cf.webp": "d1761ebf9225b2bbfd33e58109db25bb57b87b08",
        "winLP.dcaa8b07.jpg": "d6fffa5a68d124180478ccbd03c9bd1642f8784c",
        "winLS.e359a90f.jpg": "584eb10065dc876d9abf0adfbe3afe3917e013e4",
        "winW.6a3e313e.webp": "05e4bd28c3ccc906fa594d237698b1225754e960",
        "winvista.d80b2f4f.webp": "4b17bc426d8d7ddbd429568efc8a81f4af48a845",
    },
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
        # Base start sprite inherited by Aero Noir and Oxygen.
        "start-button.b35eae12.webp": "aedd5f662a1bd181ec2193131abc396c0b7d11a9",
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
    "onebit-core-icons": {
        "volume-onebit.33ed49b4.svg": "bc31cba88bbb83f8de7beaa4e09b9ab2fa54d0dd",
        "volume-off-onebit.61d24fcf.svg": "86c79ddb5c3c27f9b8bdbeb8928cbdfd0fc4e5bc",
        "volume-1-onebit.629e30d3.svg": "7faad1844c728a1b9dc4b8803e9048d5e718d2fd",
        "volume-0-onebit.44ebf44b.svg": "ae0d435063668be65b8ca4d00637431dd94c7fda",
        "network-onebit.bc98df3e.svg": "4f5a442e2e5419ab3ee218f20016ef14f16d1abc",
        "network-off-onebit.a9393cd6.svg": "31e591e23de273c63bb668090341e7d66d108a9f",
        "action-center-onebit.1bd0c609.svg": "d361690f40d879d4e7b4d70fe63ab96392aa36d5",
        "action-center-base.d153243a.svg": "6a0ac6be0341d40249a8582b1dc89f2975b964d6",
        "computer-onebit.ce54e8ef.svg": "e2baedc909a189fdddad1db321485c06ed2d5ee5",
        "bin-onebit.b4ba1ed0.svg": "642007c89d5872342b1d7cdc2675833689eafbbe",
        "folder-onebit.11d8e8ae.svg": "4a2b3e84607400eb15ca05b37161228db920fcc2",
        "file-onebit.86e331c1.svg": "433b4f6d68751c58a9053bedb4fd35c9d84c7e8f",
        "start-onebit.76d1ba55.svg": "3101d47dc3e6980789d5dd9adbb5867a0de09b41",
        "disk-onebit.f548a0b4.svg": "1c77f115b853638d6c2d462753647088b249ae9a",
        "calc-onebit.7ec329f9.svg": "d4476158c5fde19e6f59c525d78f30840d4f3ba1",
        "cpanel-onebit.97f4504b.svg": "2746ee203f3727d8486f7fb8686bd828ed94045b",
        "notepad-onebit.b01fbf08.svg": "1f9aba7b95296f77c146a9e84898d8ab8733c42b",
        "cmd-onebit.79f55a17.svg": "58b39105f303024b94daf2fd0dc28a80766cab78",
        "text-onebit.885050ef.svg": "56921f03452353ca46a04ba494192ae6192459f7",
        "default-onebit.aa73533f.svg": "fba1b2f1de98e732cb00c535ac1b260ebf1677ed",
        "shortcut-onebit.25a406da.svg": "160fa71120c53bf040f4e885b761dc4800541b4d",
        "media-onebit.e7e32a4b.svg": "e7e3c62ed0af78a4a9e0454ffc50ce286b3e5f8a",
        "zip-onebit.75fd7aa6.svg": "80aed828fc8107258fcaf123e265063f01bc6bc4",
        "desktop-onebit.1ee5fa8d.svg": "2c07a1dd18e2cada8a00fa9d1d0db1bf8aecb7bb",
        "power-onebit.9672be1f.svg": "ff7130abef828cd6a63e3998e95d76ee15c2c6dd",
    },
    "vista-core-icons": {
        "calc-winvista.46d50b40.webp": "6e51f486d95b4b6dd367d6f06883ca3cacdffcc3",
        "cpanel-winvista.aee2401a.webp": "92d2615acd7b2a167146687ae15b437e7cbe34f8",
        "folder-docs-winvista.d37b911b.webp": "a811c757c1b9d89fda39c5ca59171c3db090e7f7",
        "folder-downloads-winvista.e9a11f63.webp": "570dcd9b9c625b82d15c8c49cfb5ceab96c38e63",
        "folder-music-winvista.f77b8b67.webp": "1677fd1dae9ca761ea33baa1c9cd1f29250ccb8e",
        "folder-pics-winvista.73e408b9.webp": "d88d1f40244c7cb6e67d91f834c8decbfbad0259",
        "folder-videos-winvista.e4bb726b.webp": "6a4f698966dec90e02fdf57e3856441f6c1ad80a",
        "gadgets-winvista.9645eb0d.webp": "a7623b593845a7ab45147cf3c72a2b398854b1d2",
        "paint-winvista.2f8923fc.webp": "8180fc5607da9afdb7b856de57e7ab4ddf74276b",
        "start-button-winvista.f48c809a.webp": "8df83c9dcad23852e80fc0be18a94a4c365c85b4",
        "sticky-winvista.2eb5a2ad.webp": "ff358087b2077894ae36d9cc7e1cfde854e07650",
    },
    "longhorn-whistler-core-icons": {
        "start-button-winL.bcbc8d89.webp": "709a9ac6438c19f6b93167799200635822eb36a2",
        "start-button-win2k.650d501c.webp": "d9557b9d17ff01294c0942fa90102af15586f2e7",
        "disk-connected-winxp.e32b5363.webp": "834ab0aa5b5350cc57824c161e90d6661025c755",
        "disk-disconnected-winxp.3537cb22.webp": "7f9315ce6528d8446e520a172852ad6c44feaff8",
        "desktop-winxp.da2acd23.webp": "1160a65e8e89a32a60e246630060902c1cb9e5ea",
        "restart-winxp.3e97eeb0.webp": "65bff59571cddac700a989ed785247bf47cb1eb6",
    },
    "oxygen-core-icons": {
        "computer-oxygen.d170989c.webp": "fa0980be577279f57610f6887fba85bfb2bc9013",
        "bin-oxygen.b6be9ff9.webp": "c38c414f6d0af66cf8be91726c596409307130e6",
        "bin-full-oxygen.a82e7824.webp": "664dd1fb0d3fa3e32f475d3c9020c0edc6869e44",
        "folder-oxygen.b048f163.webp": "a360ef426134eaacc593ea6b7d96be872b71bee8",
        "file-oxygen.7a4e1a22.webp": "97dc249ebd8c834f509a68a8074149bc04ee552c",
        "folder-docs-oxygen.c90421ab.webp": "6592889c5462f2289f56bea2e603b35cce284d54",
        "folder-music-oxygen.cd81f2bb.webp": "fda5d59bba19aa99aee5f40d17115f0d6abbab5e",
        "folder-pics-oxygen.4782ad04.webp": "d333072f3b080341b689794d109f3b57fe64e10f",
        "disk-oxygen.9b235af5.webp": "138d7aca89d47ecb4ca8f5033c380efcc4e8247f",
        "disk-cd-oxygen.c2083455.webp": "9148b2c56c12168bcc61060272649f92e239102f",
        "disk-removable-oxygen.baaa39fa.webp": "2cc67bbe6047fb345dfd59ade2e478eccdfc9d2c",
        "calc-oxygen.d1995bc6.webp": "d4bddf635b4b7b785b9d919dab55006589ca15f5",
        "cpanel-oxygen.ddd1bb31.webp": "89f33365491d181ebe347dfb190cfb1f69b7c3db",
        "notepad-oxygen.9f263926.webp": "b93d56d6e5e7b3d289002c31e42964dfea301892",
        "cmd-oxygen.b7d25079.webp": "0149081d473c3de778a4040f2acac2276c9d13da",
        "text-oxygen.95901e25.webp": "e268a49d17b7ac437cb2ffe57c477b11c7af7761",
        "richtext-oxygen.f5743000.webp": "f29673d5c13d6525d69e8bc379cf074d72fd53ff",
        "executable-oxygen.33e505c2.webp": "913b3ce207ea4ab1eed6bdaa210ebddf1b279f7e",
        "shortcut-oxygen.f9210347.webp": "65f5036492bd070f16ec5f244e1c3a8fc32818ed",
        "media-oxygen.1799a7a7.webp": "6bb2caf54cc9c190613d86a2f0783c94a89e1edd",
        "zip-oxygen.38e964f7.webp": "a1cf636192f468e47e66ab83d0e9d21d6b69dfee",
        "desktop-oxygen.d7075bf2.webp": "f559772cf3696e77037d7937e50f744fb24200d4",
        "logoff-oxygen.051fb842.webp": "5192eeee4c334c6aed677ea3bafac6c4d24fc983",
    },
    "aeronoir-core-icons": {
        "computer-aeroNoir.1a117c0c.webp": "d4525a60ea629c475f95a5c2f0f7c7bf7963298c",
        "bin-aeroNoir.12b5ed31.svg": "61f5ee8f014c6beebcc93dcdd30efddc55e4920f",
        "bin-full-aeroNoir.6bcff3f1.webp": "390760d395395e4cb55653d2dee6c2d3b1e29566",
        "folder-aeroNoir.0a237526.svg": "4024cd76cf1313b3398b0172f932042997a2d321",
        "file-aeroNoir.a9c655e6.svg": "664ff0a886196f23f0d85b7d24bb0b5ddc690371",
        "folder-docs-aeroNoir.e177413f.svg": "c245bf2c0adc3536989e7f2139372e093a34e49e",
        "folder-downloads-aeroNoir.95a9aee9.svg": "4d413594e8d373728abb726d00856b1a0f594e17",
        "disk-os-aeroNoir.54eed116.svg": "19ee88c66616082d910c6f8e8572d13adaa585e9",
        "disk-data-aeroNoir.ea90c364.svg": "791f8560d65f36ec4ded80dfe779e640fb79ca25",
        "disc-aeroNoir.fac45aa1.svg": "b3a0f6cfe335bf1e11a9ef6110c4ddabff1660bf",
        "calc-aeroNoir.75c6cdda.svg": "7b2b750313a5108a2c7fc1a7f24e6d99ef0e3d22",
        "cpanel-aeroNoir.9ba00864.webp": "a8faa811bb78e766f2a1145bed8025c955272d1a",
        "notepad-aeroNoir.87d75ca0.webp": "01ef44cf7aba707267db646b91a2126580d23741",
        "cmd-aeroNoir.6b41da99.webp": "650e6174631b16c1e3f97bb67b990c951bfcefd6",
        "text-aeroNoir.dc3a397c.svg": "e0f2e83e7f56e3f8b87483b39b1b58004a8bd899",
        "richtext-aeroNoir.0a8b71f5.webp": "316ada3774cafefb5cb588a3679dfff08c0b98cf",
        "executable-aeroNoir.229e3731.webp": "379d765a4ee4996296552e4d43fd36577a5eb547",
        "shortcut-aeroNoir.cd6dda1d.svg": "472213e56d3b03c6473d7aa8ed4e21da9fa48b32",
        "media-aeroNoir.c443b1a1.webp": "f9e865873ca63c96b78ac8517ec17e7a98592285",
        "zip-aeroNoir.20c3456d.webp": "5b4fb6ec7ac66b09d7b13e13dc0c9b8a28517949",
        "desktop-aeroNoir.3821791a.svg": "c410dbed0e237500b62c0f34a512fec7aff13881",
    },
    "kubuntu-core-icons": {
        "computer-kubuntu.21e2af5f.svg": "6be91f2c05b17fbacead304a6bf2e45f8547ac6a",
        "bin-kubuntu.9e105407.webp": "b3ded4c7a96bac6c6fd6e974282d5baacb33e42f",
        "bin-full-kubuntu.52b4bff6.webp": "1884596416942dc6216a16b845bfa97be9bd5cd1",
        "file-kubuntu.7dae3497.webp": "f224b657f9266f22e1c742e26b07ac8b57c38b0a",
        "start-button-kubuntu.70b91e6e.svg": "8d74c2bb950349fd7ef9b6dcbd7384da10d90614",
        "folder-docs-kubuntu.bc09a419.svg": "8a80785d21974db65bf61396fd5e7ddec3bc6c51",
        "folder-download-kubuntu.3ddfc03d.svg": "34f1eb0d92a6bc260722305d6c08e91c55175f09",
        "folder-music-kubuntu.bdd260b5.svg": "b8a4467fdba049007d4f865f8c609393faff0a03",
        "folder-pics-kubuntu.372cdadd.svg": "aa936b88d12a7d7c4beeaffad2a48cf9be913fe9",
        "disk-os-kubuntu.367266ba.webp": "c3752267d6fb5bf888242db7f472489eadd59d0b",
        "disk-data-kubuntu.dae58e0b.webp": "71e0e9649db8afd602c7646804eba5a9c854649e",
        "calc-kubuntu.1cae644c.webp": "b2cbafe92ff8f6cf6f23479b19ca34bd0178e7c2",
        "cpanel-kubuntu.34a12acd.webp": "0ced0189556252557132150fdb75a92b2c719255",
        "notepad-kubuntu.3cbb25e5.webp": "acfe7bae0e74e47a5022b12def5da2b91cb58eb1",
        "cmd-kubuntu.38e94c40.webp": "1e54aa15419d1bdcaadf518dc46543bdde92aa79",
        "text-kubuntu.3a6c3fc7.webp": "a171f74072e59153c790d224849a1fa1af4e86bf",
        "executable-kubuntu.07e7f7b2.webp": "54222eec3d43028ed268b60e6536c9f949bc8273",
        "media-kubuntu.d9fc4ff6.webp": "f987c8eb397ab7577da6404c1b5cb23cabe25a62",
        "desktop-kubuntu.caba3657.webp": "19fab899d6a010d7be81b2dff00821f5c81c717a",
    },
    "ubuntu-core-icons": {
        "computer-ubuntu.ab0d9786.webp": "6d3232ccbbe3989408ea7218b57a9f00053d7b18",
        "bin-ubuntu.509f78ac.webp": "e55f3fcf62d362aebc74912c375dc6d66689f2d6",
        "bin-full-ubuntu.2faf5a4b.webp": "56d3d9cb76c2b43180021dcefd8c27ecf1b61c14",
        "folder-ubuntu.73afbe73.svg": "e62502f475718017e65ff12658f39478c4a8b19f",
        "file-ubuntu.2f731416.svg": "67b2acd58b22c404da51281f785732ac94924906",
        "start-button-ubuntu.a6d206e0.webp": "fb3d8e0b61e68f18cb8c12f08c27921ff48a9272",
        "folder-docs-ubuntu.d9b020ee.svg": "8f37790f9b5bd0e93315833220bc6e35fd5ea4d1",
        "folder-downloads-ubuntu.367c96da.svg": "ef7f77443bc12cba23aedf7658ef67f12faf0ab3",
        "folder-music-ubuntu.c191048c.svg": "5834153ae3f2adc194afbeac934371ae3521ea58",
        "folder-pics-ubuntu.f0402adf.svg": "2919a353803917313a80fc21cde33afb24585330",
        "folder-videos-ubuntu.c9f591cb.svg": "7312eb7dacb0de51657943ef750678988b7ddb44",
        "disk-os-ubuntu.21cd56d7.webp": "77ef0244a2d16efe02e10506fc01613f7a563c62",
        "disk-data-ubuntu.2dd831a0.webp": "fc5cdcfb471a0601589ccf10da6581850e276a00",
        "disk-cd-ubuntu.8116cfe5.svg": "8c97ff9a106daea4f1b9af9c9c8fa8c8eabc3558",
        "disk-connected-ubuntu.bcb836ee.svg": "78ee3d043404958d5757bf7248923a220eb6579e",
        "disk-disconnected-ubuntu.6f41bf79.svg": "43247f7174e6e014f1802518c83745c2330ec021",
        "calc-ubuntu.52ed0dee.svg": "bf2970da73202691caa0ed729fd02e702c145b0a",
        "cpanel-ubuntu.0464e08d.webp": "17288d039c5d3c0b42e0c543ac68b721cd7d07f0",
        "notepad-ubuntu.cc9f1715.webp": "cffcbab5d3a28ebae9a41bdc0ac95a8639610d48",
        "cmd-ubuntu.393c1f91.webp": "31a222e0f2b0c929a86e510f512de93c57b9b2aa",
        "text-ubuntu.733fe14c.webp": "29fc5af9a6270ac51add619b06e025437df90a86",
        "richtext-ubuntu.31b42436.svg": "5372f5d4d6cac27da33e91f7f6819a2df77905bf",
        "executable-ubuntu.55e207d7.webp": "750dcbdb539c9a8f21089b6093ae537d4a9b9123",
        "media-ubuntu.991db543.svg": "3ed8737b9b31a6b89dc1ad894aeb8e4042ad3a0a",
        "zip-ubuntu.cef6da1f.svg": "6197de26117583ef05c457b743f3d2eacbb9ff57",
        "desktop-ubuntu.ca166b4b.webp": "94dbc1514adf2903f90149703248c1de67e87b66",
    },
    "chromeos-core-icons": {
        "computer-chromeos.f4f817d9.webp": "b85b0ed3c0ca4ff923a409e4ae14e336695e2258",
        "bin-chromeos.6bccf38b.webp": "062303b8e132ca721ad2d1983e0b4611ae584009",
        "folder-chromeos.fa700781.svg": "9f93a851af9186f786e610988ef45c7d4bdde514",
        "file-chromeos.c40dd66d.svg": "6d576da2c04ab9ec7d2c661366db33d58a9c22e7",
        "downloads-chromeos.729e50f7.svg": "cb2a9260d575d73701998a10ecce39b7cbe626da",
        "disk-os-chromeos.8e3d1d59.webp": "fcd879a14e79ea901758cb9063ec6012f4d29dad",
        "disk-data-chromeos.eb3a943a.webp": "33759ebfe1bbfb6f033203f80ecac0503864824f",
        "disk-cd-chromeos.f4c2176f.webp": "1d8699f3e99f333b3d22f5576c4109cc6276dc42",
        "calc-chromeos.a98e0827.webp": "135c96c18d0868b4ceaba9e352870730726fca39",
        "cpanel-chromeos.208392b0.svg": "2875110f69d11521be793d93d6848be25d1a57b8",
        "notepad-chromeos.9c15f97a.webp": "301a15f807fb781e589f5155641934eca184c0d8",
        "cmd-chromeos.255c4ab1.webp": "a9a8d05fac00afa98432fecf173bd676e9f11494",
        "text-chromeos.76d507c5.svg": "6d69da879e43b113b9f9e7ed89cf166bed1e530b",
        "executable-win10.8269999b.webp": "3de29dd3021e215ce9dcce6b02481493aea249bf",
        "shortcut-win10.c8f56fdb.webp": "b6d6f8da32230ea4e758a82d88fd0d5adeb6565b",
        "media-chromeos.51aced5d.svg": "c4ead31d14d228f0f983883a6a45cec3539fa3eb",
        "zip-chromeos.f405c15d.svg": "98ab69a5dfb5b3b290408f82a7d287a43e129370",
        "desktop-chromeos.26c36183.svg": "d8342e807ebf7b66d8d8a3bb06afe1f625880d46",
        "chrome-chromeos.9384cbbf.svg": "51b472b7c3e26fd9c6246276b50746fab5a84b78",
    },
    "macos-core-icons": {
        "computer-mac.4c6c5258.webp": "396c447553e3d65f53e9f11324d18a79c71d75f6",
        "bin-mac.499e907b.webp": "5068639d3c661b103dd32c4b67ece1443c68fccf",
        "bin-full-mac.67e3d272.webp": "a2359a609e7a1b196882de90f843d012bc3d5e31",
        "folder-mac.248938aa.webp": "5388631ce57963a0e466e979e114190f30f33bc8",
        "file-mac.f9d8e370.webp": "d63971144dd6b01c265764287e7492646df0fe2f",
        "start-button-mac.db7da45a.webp": "ec21761c89ac80cede74cd5e7e86b5900c25a851",
        "folder-docs-mac.19ef120e.webp": "3a1a82fe2fa23ca1116ec09cb0dd7a9e0409a557",
        "folder-downloads-mac.5a239779.webp": "b8593e90b1e31178126b121860da1fc636c73997",
        "folder-music-mac.8905b037.webp": "4f90aef2173ea53bafd17388e478c88e480e5707",
        "folder-pics-mac.dfca3097.webp": "fd1ca65797fb7d2691a3f4834ba404d5f085bee0",
        "folder-videos-mac.7edd23bf.webp": "a89a39fa2f942050198881e4cd1e4658f47fc0e0",
        "disk-mac.c1f755d1.webp": "12dcce8d3df6caf468c01d2c571554515c3ed2df",
        "calc-mac.a8be886f.webp": "55a6d2f8e67e0c3695b89ba26ed1cb142c1daae2",
        "cpanel-mac.edf3e86a.webp": "77b5594dc9841eddf19c320ed2705b6000b2b72d",
        "notepad-mac.82ca5f3f.webp": "7acad2bcd69796200746cf1ec363ee429cb31c35",
        "cmd-mac.4736d145.webp": "dbb55722503ca1c9ebabb71bc66d721c3dcbf655",
        "text-mac.2378630a.webp": "1b2f0e7d0f66102a2643045ef3d27b034aec0bf8",
        "richtext-mac.2378630a.webp": "1b2f0e7d0f66102a2643045ef3d27b034aec0bf8",
        "executable-mac.73f92274.webp": "ed212fe1af03b6090f7f896c1757ee76962e7c33",
        "shortcut-mac.45146f00.webp": "f3909cf064b096718f9d8ee4205c1326e779d24f",
    },
    "shared-desktop-navigation": {
        "desktop.96562ad8.webp": "0b5c0330f4889f55d1831b3a79b8a316966fc03a",
        "desktop-winxp.da2acd23.webp": "1160a65e8e89a32a60e246630060902c1cb9e5ea",
    },
    "macos-tray-volume": {
        "volume-0-win10.319871af.webp": "eb0f0fd66412c44de175e1f267a9775af47129f0",
        "volume-100.fb90d926.webp": "66cfd7789418fdf74519af88fc5b6d80d12e4058",
        "volume-muted.e186b3c5.webp": "365f4deb6c2198d0164a0d5ac33f5dca61995659",
        "volume-65.bf0b7991.webp": "3f066e6c9f762b0d45ab7dd3870baaa24c02b6f8",
        "volume-32.1859a18f.webp": "b26b881eb710087379756b8c592e0024241601e2",
        "volume-0.8c249580.webp": "891591942f998206d053bda6a82e2ed34ca526a6",
        "volume-32-win10.0c0304cf.webp": "8ea19fcc333559b90803b13291f2b276c101ff32",
        "volume-65-win10.fcea34a7.webp": "cb0af1de2f69894620107c4bbcd739f84b818c04",
        "volume-100-win10.5647dfdd.webp": "ec5394cfefdb2f8b6b67bb42e755668b2eecb96b",
        "volume-muted-win10.9bff41dd.webp": "e866280eb8bb5b81ef93cf2eb0a30d9c1d74c2c9",
    },
    "macos": {
        "macos.54af5cd4.webp": "a2ef4cea31559d755388afd5e6e5207659d07646",
        "guest-macos.caf967b3.webp": "0ffc437084814b13509a2e31353ab4b1e33b8f22",
    },
    "chromeos": {
        "network-off.2d8dfd51.webp": "a3629b5a1b158f752810f03b6dd3ce7fdd33aafa",
        "action-center-error.e8a7e681.webp": "a15298c34fbf2d89891c00e9e829c2a3a973b905",
        "action-center-warning.fc9ed53b.webp": "19ab6fd74afdecb04f2011c4f7fdcf38922c3b86",
        "network-wired.c19a6640.webp": "c1709ddbb3ce0832bc8b3638d33654bf50e58cc2",
        "network-signal.4305a101.webp": "09de3646e6db7efe16d80a2083cba6ab64bd9a13",
        "google.d3503fb1.svg": "a971e1d7a9dbfc34674b15dadd401769d6dffd97",
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
        "about-winxp.4d3ad58f.webp": "17074eb6ced62c6ba6390088065067c08411ac2d",
        "access-winxp.c88ef204.webp": "05ae6bc9213f6fca0b0a5c1cef037701f96ebd5c",
        "arrow-winxp.b58eda4d.webp": "01a3ad5e3893b6ae1bb1f8f3676d5188659f472e",
        "accounts-winxp.f09bda44.webp": "1ed955eb7d81f0ab2ccefed9856d34073b35688f",
        "notifi-error.362aae4b.webp": "f82b52185efb2fc5f78f44e7e6b84c7f76a4af68",
        "notifi-success.9bd6d775.webp": "960f9cb9a88d07534561dd19a98e95c6c36591b5",
        "notifi-warning.44f565cf.webp": "6b585c94ce7f361af248dc56fe6c7f00f81e0def",
        "error-win2k.ceba73c0.png": "6e84307f9b33596d2914d63e82dab21cae30fab2",
        "success-win2k.7b281bfb.png": "e379a591dcc024558753316466f0cd1a23132c13",
        "warning-win2k.333f629e.png": "309941ee61f9a7e74e3b64fc650a848a88347ff1",
        "notifi-error-win10.956ad576.webp": "90f61bcefafbd32a048ecd55eb52181ed2192932",
        "notifi-success-win10.5fdfecb5.webp": "77c78f79c1bd96c47dba60be95c77d127cd86236",
        "notifi-warning-win10.e1a2a370.webp": "68b4f2413bdd12d7f88830d3dd8087e468d31a55",
        "close-onebit.a1490e2c.svg": "e443506cb38041175865aa8137f87f0fd7a0db42",
        "check-onebit.35be58dd.svg": "f57f634039af3c9e8fce8def999da7b5944528b2",
        "alert-onebit.809dcd0e.svg": "605140cdb7049691b2bd6983670138d270d06f55",
        "battery-meter.66984ffe.webp": "24a6a6926c5bddd09f08296d38dd7aad82028cc9",
        "battery-charging-winxp.321f84b7.webp": "1ae90896f2883b34638b51cf9e368e150b71612f",
        "help-winxp.6b449d71.webp": "eb5fa27e07a8e26c23105c500d5da9921ad9d2e4",
        "keyboard-winxp.648c2cdc.webp": "84caa2cefbaec2cd69fa5af900721668285dc3bd",
        "mouse-winxp.c5534a40.webp": "764c52c89b9bcedc4dd674b283b82ef1be1f709d",
        "network-off-winxp.60414007.webp": "5a1c50a6481bde6c10f18ea2801a47890f333019",
        "sound-winxp.1ff35c0e.webp": "0c62743d2fd531f2f8b150c0106138ffe039c61b",
        "volume-muted-winxp.70d8b244.webp": "96b513d4b2d03980c9318ff4f3185ca5e3427e48",
        "search-winxp.92dbc7ef.webp": "e4a6efdb6644faa29ab93bb125d8da1710a60e98",
        "speech-winxp.a5b18330.webp": "2f0dc868ee1ad805df9af2c7415224e13c56402f",
        "system-winxp.74879c1e.webp": "5a09b69a9e7c2ce1d702afc38d9fe9434d053e95",
        "update-winxp.85628670.webp": "b93460c17e7a7a43877fce77c933c0033fe2fe7f",
        "logoxp.9b034658.png": "33b3bca96d3c07994b096bf13d2a87a6a05b1196",
        "action-center-winxp.52f44912.webp": "56cc03e77b7ce0097db3addd9463d0d8b22c502f",
        "network-winxp.744648d4.webp": "17a20ab4a2949d8d146c61eef931f741eb714d89",
        "sound-win2k.6b4cee4c.webp": "6c12f86405ee9d8ba1f47b2ad4d9a218673d875b",
        "sound-muted-win2k.c4df5325.png": "319c9f87788e3e3252686aecfb546ced86c45763",
        "network-win2k.798c0454.png": "cbe3b585ecb17dd2bb0eb5bd9fef463f24795aee",
        "network-off-win2k.a6d55774.png": "f59be6ac2b2e0eba9c7ed7bc72f8d577472c84d4",
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
    parser.add_argument("--themes", choices=tuple(FILES), nargs="+",
                        default=list(FILES))
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
