# Original Windows Vista Guest logon — 24 November 2026

Pinned legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776. The original has no separate logon-winvista.js: src/modules/shell/logon-win7.js module 8ba0d branches on bootTheme === "winvista". It uses login-winvista rather than login, shared framed Guest avatar, start-button-classic brand (32px), and Windows Vista® Professional (30px/24px) rather than Windows® 7 Simulator. The original common shutdown group uses misc.shutdown and 42px + 24px hit targets. Vista-specific React styling preserves that source branch; Win7's established layout remains unchanged.

Original assets copied with matching source/destination Git blob hashes:
- login-winvista.7a523d62.webp — 88fbd430ea5cb10893cb89092c562528ed779464
- shutdown.08d3f74a.webp — 6a4478b1e3c9319030f42a09a6aaf79fe0dbef3e

Original artwork audit, scoped CSS, SSR tests for all 37 IDs / 19 family selectors, and desktop/mobile Vista browser regression. All configured logon families now have partial source-specific renderers (Vista intentionally shares Win7), not full visual/functional acceptance. Account auth/loading, exact source geometry and screenshot pairs remain pending. Source shell module remains in-progress.
