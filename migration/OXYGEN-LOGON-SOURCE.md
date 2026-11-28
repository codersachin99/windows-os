# Oxygen original Guest logon — 24 November 2026

Frozen source: legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776.
`src/modules/themes/logon-oxygen.js` module fc4f uses the shared logon-base (eb37), default Guest icon, 128px circular avatar, 6px padding, white text and original oxygen background; black 50% overlay with blur(10px), 140px minimum gradient form button, 6px corners, and centered bottom-32px power group with 16px gap, 96px minimum buttons and 40px original Restart/Shutdown images. Source CSS supplies the 0 0 8px 4px white/60 hover shadow and translucent white power hover. The base pane is shifted upward 48px with a 16px gap.

New source assets verified by source/destination Git blob equality:
- oxygen.414aed47.svg — 0c19a29a1499e0b42d172f9e7517fd85d4710793
- restart-oxygen.d4450a1a.webp — 649a96ea0f18963bb536b2e9ee9693d5ff9b958c
- shutdown-oxygen.62df7a25.webp — 408a3db796a44c99d0baad29d65c690e061acf04

Existing guest.1a7eab2b.webp is reused. Assets registered in sourceThemeLogonArtwork and audit script. React Guest and power buttons use existing lifecycle callbacks; unavailable account authentication is explicit. Short viewport accommodation is not a claim of original responsive equivalence. Added SSR and actual desktop/mobile browser checks, catalog expectations and focused CI inclusion. Module remains in-progress; Oxygen desktop shell remains pending. Source screenshots, full auth/loading/error behavior and exact source geometry remain pending. Previous Personalize CI #45360503128 was still in targeted browser stage; no redundant CI requested for this slice until previous result is known.
