# Kubuntu core icon registry — 24 November 2026

Pinned legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776, src/config/icons.registry.json (21db2d896ba9c1477f67239795c0991f0df7fbc7), themes.kubuntu. 27 registry keys map to 26 original paths: 19 new byte-identical files and seven verified existing paths. The source intentionally aliases generic folder to Computer SVG, and Videos, CD, connected/disconnected disks, richtext, shortcut and ZIP to existing Ubuntu/shared artwork.

- computer-kubuntu.21e2af5f.svg — 6be91f2c05b17fbacead304a6bf2e45f8547ac6a
- bin-kubuntu.9e105407.webp — b3ded4c7a96bac6c6fd6e974282d5baacb33e42f
- bin-full-kubuntu.52b4bff6.webp — 1884596416942dc6216a16b845bfa97be9bd5cd1
- file-kubuntu.7dae3497.webp — f224b657f9266f22e1c742e26b07ac8b57c38b0a
- start-button-kubuntu.70b91e6e.svg — 8d74c2bb950349fd7ef9b6dcbd7384da10d90614
- folder-docs-kubuntu.bc09a419.svg — 8a80785d21974db65bf61396fd5e7ddec3bc6c51
- folder-download-kubuntu.3ddfc03d.svg — 34f1eb0d92a6bc260722305d6c08e91c55175f09
- folder-music-kubuntu.bdd260b5.svg — b8a4467fdba049007d4f865f8c609393faff0a03
- folder-pics-kubuntu.372cdadd.svg — aa936b88d12a7d7c4beeaffad2a48cf9be913fe9
- folder-videos-ubuntu.c9f591cb.svg — 7312eb7dacb0de51657943ef750678988b7ddb44 (reused)
- disk-os-kubuntu.367266ba.webp — c3752267d6fb5bf888242db7f472489eadd59d0b
- disk-data-kubuntu.dae58e0b.webp — 71e0e9649db8afd602c7646804eba5a9c854649e
- disk-cd-ubuntu.8116cfe5.svg — 8c97ff9a106daea4f1b9af9c9c8fa8c8eabc3558 (reused)
- disk-connected-ubuntu.bcb836ee.svg — 78ee3d043404958d5757bf7248923a220eb6579e (reused)
- disk-disconnected-ubuntu.6f41bf79.svg — 43247f7174e6e014f1802518c83745c2330ec021 (reused)
- calc-kubuntu.1cae644c.webp — b2cbafe92ff8f6cf6f23479b19ca34bd0178e7c2
- cpanel-kubuntu.34a12acd.webp — 0ced0189556252557132150fdb75a92b2c719255
- notepad-kubuntu.3cbb25e5.webp — acfe7bae0e74e47a5022b12def5da2b91cb58eb1
- cmd-kubuntu.38e94c40.webp — 1e54aa15419d1bdcaadf518dc46543bdde92aa79
- text-kubuntu.3a6c3fc7.webp — a171f74072e59153c790d224849a1fa1af4e86bf
- richtext-ubuntu.31b42436.svg — 5372f5d4d6cac27da33e91f7f6819a2df77905bf (reused)
- executable-kubuntu.07e7f7b2.webp — 54222eec3d43028ed268b60e6536c9f949bc8273
- shortcut-win10.c8f56fdb.webp — b6d6f8da32230ea4e758a82d88fd0d5adeb6565b (reused)
- media-kubuntu.d9fc4ff6.webp — f987c8eb397ab7577da6404c1b5cb23cabe25a62
- zip-ubuntu.cef6da1f.svg — 6197de26117583ef05c457b743f3d2eacbb9ff57 (reused)
- desktop-kubuntu.caba3657.webp — 19fab899d6a010d7be81b2dff00821f5c81c717a

Existing shared artwork resolvers route icons through desktop, Explorer navigation, real trash state, application windows and taskbar. Unit regression covers exact mappings and aliases, distinct empty/full Bin, custom shortcut handling and fallback isolation. Existing focused theme-bin-artwork browser coverage extends to Kubuntu actual trash lifecycle and folder/file creation. All new and reused hashes match the pinned source. Exact-head tests pending. KDE shell, panel, launcher and remaining 53 keys remain pending.
