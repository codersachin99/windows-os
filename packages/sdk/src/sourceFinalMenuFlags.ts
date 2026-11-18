/**
 * Final pinned legacy-win7 app.config.json feature defaults:
 * 26b9f0ce7a1665dee89a7c81824bec09e2c75776.
 * SDK consumers must use the same source toggles in Desktop and Computer.
 * Unsupported host-facing actions can render disabled until permissioned.
 */
export const SOURCE_FINAL_DESKTOP_MENU_FLAGS=Object.freeze({
  showMenuCopyPath:false,
  showUploadFiles:true,
  showMapDirectory:true,
  showWindowsCloseEffect:false
});
