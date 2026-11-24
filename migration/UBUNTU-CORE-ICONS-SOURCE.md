# Ubuntu core icon registry — 24 November 2026

Pinned legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776, src/config/icons.registry.json (21db2d896ba9c1477f67239795c0991f0df7fbc7), themes.ubuntu. 27 registry keys map to 27 original paths: 26 new byte-identical files and one reused Win10 shortcut alias. Distinct empty/full Bin, five special folders, five drive states, source Start and Desktop navigation, application and file-type artwork.

- computer-ubuntu.ab0d9786.webp — 6d3232ccbbe3989408ea7218b57a9f00053d7b18
- bin-ubuntu.509f78ac.webp — e55f3fcf62d362aebc74912c375dc6d66689f2d6
- bin-full-ubuntu.2faf5a4b.webp — 56d3d9cb76c2b43180021dcefd8c27ecf1b61c14
- folder-ubuntu.73afbe73.svg — e62502f475718017e65ff12658f39478c4a8b19f
- file-ubuntu.2f731416.svg — 67b2acd58b22c404da51281f785732ac94924906
- start-button-ubuntu.a6d206e0.webp — fb3d8e0b61e68f18cb8c12f08c27921ff48a9272
- folder-docs-ubuntu.d9b020ee.svg — 8f37790f9b5bd0e93315833220bc6e35fd5ea4d1
- folder-downloads-ubuntu.367c96da.svg — ef7f77443bc12cba23aedf7658ef67f12faf0ab3
- folder-music-ubuntu.c191048c.svg — 5834153ae3f2adc194afbeac934371ae3521ea58
- folder-pics-ubuntu.f0402adf.svg — 2919a353803917313a80fc21cde33afb24585330
- folder-videos-ubuntu.c9f591cb.svg — 7312eb7dacb0de51657943ef750678988b7ddb44
- disk-os-ubuntu.21cd56d7.webp — 77ef0244a2d16efe02e10506fc01613f7a563c62
- disk-data-ubuntu.2dd831a0.webp — fc5cdcfb471a0601589ccf10da6581850e276a00
- disk-cd-ubuntu.8116cfe5.svg — 8c97ff9a106daea4f1b9af9c9c8fa8c8eabc3558
- disk-connected-ubuntu.bcb836ee.svg — 78ee3d043404958d5757bf7248923a220eb6579e
- disk-disconnected-ubuntu.6f41bf79.svg — 43247f7174e6e014f1802518c83745c2330ec021
- calc-ubuntu.52ed0dee.svg — bf2970da73202691caa0ed729fd02e702c145b0a
- cpanel-ubuntu.0464e08d.webp — 17288d039c5d3c0b42e0c543ac68b721cd7d07f0
- notepad-ubuntu.cc9f1715.webp — cffcbab5d3a28ebae9a41bdc0ac95a8639610d48
- cmd-ubuntu.393c1f91.webp — 31a222e0f2b0c929a86e510f512de93c57b9b2aa
- text-ubuntu.733fe14c.webp — 29fc5af9a6270ac51add619b06e025437df90a86
- richtext-ubuntu.31b42436.svg — 5372f5d4d6cac27da33e91f7f6819a2df77905bf
- executable-ubuntu.55e207d7.webp — 750dcbdb539c9a8f21089b6093ae537d4a9b9123
- shortcut-win10.c8f56fdb.webp — b6d6f8da32230ea4e758a82d88fd0d5adeb6565b
- media-ubuntu.991db543.svg — 3ed8737b9b31a6b89dc1ad894aeb8e4042ad3a0a
- zip-ubuntu.cef6da1f.svg — 6197de26117583ef05c457b743f3d2eacbb9ff57
- desktop-ubuntu.ca166b4b.webp — 94dbc1514adf2903f90149703248c1de67e87b66

Existing shared sourceShellAsset/sourceThemeProgramArt and file icon resolvers route the artwork through desktop, Explorer navigation, real trash state and application/taskbar icons. Unit coverage checks exact keys, distinct Bin art, special folders and custom shortcut handling. Existing focused theme-bin-artwork browser coverage extends to Ubuntu real delete/empty lifecycle and folder/file creation. New artwork hashes verified; exact-head tests pending. The Ubuntu shell, dock, menubar, app launcher and remaining 47 icon keys are not complete.
