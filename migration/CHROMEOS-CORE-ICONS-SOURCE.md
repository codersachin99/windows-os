# ChromeOS core icon registry — 24 November 2026

Pinned legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776, src/config/icons.registry.json (21db2d896ba9c1477f67239795c0991f0df7fbc7), themes.chromeos. 27 original keys map to 20 file paths; 19 new exact files and the existing original Win8 Start SVG. Both empty and full Bin use the same source icon; Documents/Music/Pictures/Videos share generic folder art, Downloads uses distinct SVG. Disk connected/data/disconnected share source art. Executable and shortcut use explicit Win10 aliases.

- computer-chromeos.f4f817d9.webp — b85b0ed3c0ca4ff923a409e4ae14e336695e2258
- bin-chromeos.6bccf38b.webp — 062303b8e132ca721ad2d1983e0b4611ae584009
- folder-chromeos.fa700781.svg — 9f93a851af9186f786e610988ef45c7d4bdde514
- file-chromeos.c40dd66d.svg — 6d576da2c04ab9ec7d2c661366db33d58a9c22e7
- start-button-win8.2e5214cc.svg — 4fee2569b36836b595b0f13d429ad4ed967127af
- downloads-chromeos.729e50f7.svg — cb2a9260d575d73701998a10ecce39b7cbe626da
- disk-os-chromeos.8e3d1d59.webp — fcd879a14e79ea901758cb9063ec6012f4d29dad
- disk-data-chromeos.eb3a943a.webp — 33759ebfe1bbfb6f033203f80ecac0503864824f
- disk-cd-chromeos.f4c2176f.webp — 1d8699f3e99f333b3d22f5576c4109cc6276dc42
- calc-chromeos.a98e0827.webp — 135c96c18d0868b4ceaba9e352870730726fca39
- cpanel-chromeos.208392b0.svg — 2875110f69d11521be793d93d6848be25d1a57b8
- notepad-chromeos.9c15f97a.webp — 301a15f807fb781e589f5155641934eca184c0d8
- cmd-chromeos.255c4ab1.webp — a9a8d05fac00afa98432fecf173bd676e9f11494
- text-chromeos.76d507c5.svg — 6d69da879e43b113b9f9e7ed89cf166bed1e530b
- executable-win10.8269999b.webp — 3de29dd3021e215ce9dcce6b02481493aea249bf
- shortcut-win10.c8f56fdb.webp — b6d6f8da32230ea4e758a82d88fd0d5adeb6565b
- media-chromeos.51aced5d.svg — c4ead31d14d228f0f983883a6a45cec3539fa3eb
- zip-chromeos.f405c15d.svg — 98ab69a5dfb5b3b290408f82a7d287a43e129370
- desktop-chromeos.26c36183.svg — d8342e807ebf7b66d8d8a3bb06afe1f625880d46
- chrome-chromeos.9384cbbf.svg — 51b472b7c3e26fd9c6246276b50746fab5a84b78

Shared asset resolver supplies existing desktop, Explorer, Bin, taskbar and application window icons; desktop navigation now uses explicit themed desktop key where present. Unit and existing focused theme-bin-artwork E2E cover true trash lifecycle (including empty contents despite identical icon), Computer, folder/file creation and special folders. Original hashes verified. Remaining 39 keys and actual ChromeOS shelf/launcher/window geometry remain pending; no complete shell claim. Exact-head tests not yet executed.
