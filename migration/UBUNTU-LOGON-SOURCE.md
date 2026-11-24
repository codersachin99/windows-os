# Original Ubuntu Guest logon — 24 November 2026

Frozen source legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776: src/modules/themes/logon-ubuntu.js module 94a5, logon-ubuntu.css, taskbar-ubuntu.js c56e, shared taskbar-macos/taskbar-ubuntu menu factory and taskbar-ubuntu.css. The login uses the shared logon-base, 88px guest-ubuntu art with 20px padding, dark #2b2b2b circular avatar, 4px white/20 focus/hover ring, 140px minimum translucent gradient form controls and 192px bottom-centered logo. Source logon-only taskbar hides Activities, clock and desktop tray controls; 32px #131313 top bar has System menu, whose only entries are Restart and Shutdown, in source #1d1d1d / #3e3e3e 8px-rounded popup. No unavailable host controls are presented as functional.

Imported exact original assets by matching source and destination Git blob hashes:
- guest-ubuntu.e2037acf.svg — 496b816c138dd8c57f9007437798cf4b1516b509
- logo-ubuntu.b06d4c47.svg — a1f643846d1a2b1d95de2ea7b589ae451dd8f92e

Scoped React screen, artwork manifest/checksum audit, SSR and browser tests for appearance, logon menu actions, keyboard navigation/dismissal, account fallback and Guest lifecycle. A simple power glyph represents the source iconify fa:power-off; exact glyph, source composited background, source spinner/loading and account authentication, original screenshot parity and entire Ubuntu desktop shell remain pending. Short viewport adjustments are adaptations, not certified original behavior. Tracker remains in-progress; shell status remains pending.
