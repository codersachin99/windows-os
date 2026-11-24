# macOS core icon registry — 24 November 2026

Pinned source legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776, src/config/icons.registry.json (Git blob 21db2d896ba9c1477f67239795c0991f0df7fbc7), themes.macos. The core slice maps 24 exact registry keys to 20 original file paths. The five disk keys deliberately share the source disk image; text/richtext are different source paths with identical bytes.

- computer-mac.4c6c5258.webp — 396c447553e3d65f53e9f11324d18a79c71d75f6
- bin-mac.499e907b.webp — 5068639d3c661b103dd32c4b67ece1443c68fccf
- bin-full-mac.67e3d272.webp — a2359a609e7a1b196882de90f843d012bc3d5e31
- folder-mac.248938aa.webp — 5388631ce57963a0e466e979e114190f30f33bc8
- file-mac.f9d8e370.webp — d63971144dd6b01c265764287e7492646df0fe2f
- start-button-mac.db7da45a.webp — ec21761c89ac80cede74cd5e7e86b5900c25a851
- folder-docs-mac.19ef120e.webp — 3a1a82fe2fa23ca1116ec09cb0dd7a9e0409a557
- folder-downloads-mac.5a239779.webp — b8593e90b1e31178126b121860da1fc636c73997
- folder-music-mac.8905b037.webp — 4f90aef2173ea53bafd17388e478c88e480e5707
- folder-pics-mac.dfca3097.webp — fd1ca65797fb7d2691a3f4834ba404d5f085bee0
- folder-videos-mac.7edd23bf.webp — a89a39fa2f942050198881e4cd1e4658f47fc0e0
- disk-mac.c1f755d1.webp — 12dcce8d3df6caf468c01d2c571554515c3ed2df
- calc-mac.a8be886f.webp — 55a6d2f8e67e0c3695b89ba26ed1cb142c1daae2
- cpanel-mac.edf3e86a.webp — 77b5594dc9841eddf19c320ed2705b6000b2b72d
- notepad-mac.82ca5f3f.webp — 7acad2bcd69796200746cf1ec363ee429cb31c35
- cmd-mac.4736d145.webp — dbb55722503ca1c9ebabb71bc66d721c3dcbf655
- text-mac.2378630a.webp — 1b2f0e7d0f66102a2643045ef3d27b034aec0bf8
- richtext-mac.2378630a.webp — 1b2f0e7d0f66102a2643045ef3d27b034aec0bf8
- executable-mac.73f92274.webp — ed212fe1af03b6090f7f896c1757ee76962e7c33
- shortcut-mac.45146f00.webp — f3909cf064b096718f9d8ee4205c1326e779d24f

Shared sourceShellAsset and sourceThemeProgramArt resolvers supply desktop Computer and Bin, real empty/full trash state, generic file/folder icon selection, existing Explorer navigation special folders and drives, Start icon, and selected application/file type artwork. Preserve custom shortcut URL overrides and safe unknown key fallback. The existing macOS shell is still pending; this does not implement the source dock, top menu, Finder layout or remaining 40 registry keys. Added unit coverage and real Guest desktop/Explorer/Bin tests to existing theme-bin-artwork.spec.ts already in focused CI. Original Git blob hashes verified before commit. Tests not executed at this head.
