# Source desktop wallpaper defaults — 24 November 2026

Frozen legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776, src/modules/chunks/shared~plugin-cssvar~sandbox~vue-app~vue-store.js module 3b8c. Correct ten missing image defaults (Vista, macOS, ChromeOS, Ubuntu, Kubuntu, Longhorn Slate/Plex, Aero Noir, Oxygen, Whistler) and source literal base #fffd / Onebit #352b30. Reuse five original artwork files already imported for logon; five new binary assets verified by exact Git hashes:
- ubuntu.3588c6cf.webp — d1761ebf9225b2bbfd33e58109db25bb57b87b08
- winLP.dcaa8b07.jpg — d6fffa5a68d124180478ccbd03c9bd1642f8784c
- winLS.e359a90f.jpg — 584eb10065dc876d9abf0adfbe3afe3917e013e4
- winW.6a3e313e.webp — 05e4bd28c3ccc906fa594d237698b1225754e960
- winvista.d80b2f4f.webp — 4b17bc426d8d7ddbd429568efc8a81f4af48a845

All ten real image paths are exposed in the already-imported system gallery subset and safe persistence whitelist (16 -> 26); no arbitrary CSS or remote paths. Solid defaults remain outside the image picker. Unit and desktop/mobile real Guest tests cover mapping, painted CSS, HTTP asset availability and reload. Shell status intentionally unchanged; this is only desktop background coverage. Original XP variant-specific images and older classic registry solid defaults still require a separate source correction; source gallery grouping, window chrome, icons, Start, Explorer/Bin and exact screenshot parity remain outstanding. Combined CI #45363645210 at fadb0e6f remains active; no parallel full verification.
