# Taskbar pagination skins

Frozen legacy-win7@26b9f0ce7: src/styles/system/vue-app.css .scrollbar__btn and theme-*-scss.js scrollbar rules, source taskbar-base.js E/N. Extracted exact arrow SVG backgrounds and XP variables from pinned files; no re-encoding.

Ported frozen taskbar scrollbar paint for Aero/Basic1/Vista, Classic/9x, Win31, all seven XP variants and Longhorn Slate (exact source gradient/border/shadow variables and embedded SVG arrows), Win8/10 flat arrows, Win11, Whistler/Longhorn Plex, Aero Noir, Oxygen, Kubuntu, ChromeOS and Onebit. Taskbar-only scoped rules preserve other app scrollbars. Kept 24px reserve for all themes (source Oxygen/Kubuntu width 22px remains a small layout deviation), accessible disabled edge controls and no arbitrary HTML. Added computed Win7 artwork assertions. Consolidated [run-ci] [tray-check] requested for pagination and inline formatting. Exact visual theme comparison and centered-taskbar capacity remain pending. Main/pin/releases unchanged.
