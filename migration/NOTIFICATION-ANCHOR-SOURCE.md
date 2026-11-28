# Notification balloon anchoring

Frozen legacy-win7@26b9f0ce7: src/modules/chunks/chunk-517d7f56.js f0ed and src/styles/system/vue-app.css (.winui-balloon), theme SCSS modern fixed-card exceptions.

Ported f0ed balloon anchoring using the measured Action Center trigger in desktop-local coordinates; source top/bottom directions, RTL alignment, narrow viewport clamping and 18px/24px tail geometry. When the icon is hidden, use the hidden-items toggle until the icon is revealed; if neither is measurable, retain desktop-edge fallback. ResizeObserver tracks tray, icon, desktop and toast dimensions; preference/hidden-panel changes remeasure. Kept toast outside the clipped hidden tray and modern Win10/11/ChromeOS fixed card positioning unchanged. Added four geometry contracts. Requested consolidated [run-ci] [tray-check] after popup/balloon/history changes; exact visual anchor still requires browser observation. No inline links or production feed enabled. Main/pin/releases unchanged.
