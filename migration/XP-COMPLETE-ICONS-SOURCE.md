# XP-family complete icon override registry — 24 November 2026

Frozen legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776, src/config/icons.registry.json. XP, Longhorn Plex and Whistler each define 66 keys, 65 identical except Start. Slate explicitly inherits XP; XP variants also inherit XP. Consolidated the shared mapping and retained the React compatibility alias personal for personalize. All 57 unique XP registry paths are audit-registered, 15 newly copied with identical Git hashes. No fabricated art for missing registry keys.

- about-winxp.4d3ad58f.webp — 17074eb6ced62c6ba6390088065067c08411ac2d
- access-winxp.c88ef204.webp — 05ae6bc9213f6fca0b0a5c1cef037701f96ebd5c
- arrow-winxp.b58eda4d.webp — 01a3ad5e3893b6ae1bb1f8f3676d5188659f472e
- accounts-winxp.f09bda44.webp — 1ed955eb7d81f0ab2ccefed9856d34073b35688f
- battery-charging-winxp.321f84b7.webp — 1ae90896f2883b34638b51cf9e368e150b71612f
- help-winxp.6b449d71.webp — eb5fa27e07a8e26c23105c500d5da9921ad9d2e4
- keyboard-winxp.648c2cdc.webp — 84caa2cefbaec2cd69fa5af900721668285dc3bd
- mouse-winxp.c5534a40.webp — 764c52c89b9bcedc4dd674b283b82ef1be1f709d
- network-off-winxp.60414007.webp — 5a1c50a6481bde6c10f18ea2801a47890f333019
- sound-winxp.1ff35c0e.webp — 0c62743d2fd531f2f8b150c0106138ffe039c61b
- volume-muted-winxp.70d8b244.webp — 96b513d4b2d03980c9318ff4f3185ca5e3427e48
- search-winxp.92dbc7ef.webp — e4a6efdb6644faa29ab93bb125d8da1710a60e98
- speech-winxp.a5b18330.webp — 2f0dc868ee1ad805df9af2c7415224e13c56402f
- system-winxp.74879c1e.webp — 5a09b69a9e7c2ce1d702afc38d9fe9434d053e95
- update-winxp.85628670.webp — b93460c17e7a7a43877fce77c933c0033fe2fe7f

Includes power, help, search, accessibility, account, keyboard, mouse, battery charging, network-off, system, update and original volume/recorder aliases. Shared program/file/special-folder resolver supports these keys; this does not assert every UI consumer uses every key or that every system service is implemented. Unit and browser contracts extended. Exact-head CI pending.
