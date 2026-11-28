# Classic and XP desktop defaults — 24 November 2026

Pinned legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776 source registry 3b8c (shared~plugin-cssvar~sandbox~vue-app~vue-store.js). The four distinct XP desktop backgrounds are:
- winxpG: autumn.41774694.webp — c26ab7b1be0c6532ab1e7a84a90d713ed9d4f79d
- winxpR: follows.3e030a12.webp — 125a6c75c12dcb47054eada034328c5d11c9aaa7
- winxpS: azul.3af33f73.webp — dfc568bad42969b77034573e31b6c6cbafa5a84f
- winxpZ: ascent.7c62e722.webp — ba6303a12c3eb5eff1e0e68379c481d4801d4e70

Embedded and Royale Noir continue to share the normal XP wallpaper. Classic literal defaults:
- win31: #bfbdc0
- win95: #007d7b
- win98: #57a8a8
- win2k: #3b6ea4

These differ from the old image-backed compatibility defaults. The already imported classic image assets remain selectable system images; do not remove them or change sourceShellAsset icon mappings. The image gallery grows to 30 and does not whitelist solid colors as arbitrary user CSS. Exact source theme defaults apply on initial selection and SET_THEME; existing explicitly saved image selections remain valid. Existing gallery cards now use the same default resolver, with solid preview blocks for classic themes. Tests cover original paths, CSS paint, theme choice/reload and distinct XP palettes. Full original gallery composition and shell parity still pending.

Prior combined CI #45363645210 failed on one stale assertion expecting Ubuntu fallback. Updated it to require original Ubuntu renderer and reject Onebit leakage. No test execution on the new commit yet; opt-in CI requested.
