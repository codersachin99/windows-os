/** The frozen macOS taskbar uses one Vuex activePopup ID for all
 * Apple and tray surfaces. Closing a previous owner must not dismiss
 * a newer popup (e.g. pointerdown or an async Spotlight completion). */
export type SourceMacOSPopupId="apple"|"action-center"|"network"|"battery"|"datetime"|"spotlight";
export function sourceMacOSPopupTransition(
  current:SourceMacOSPopupId|null,id:SourceMacOSPopupId,open:boolean
):SourceMacOSPopupId|null{
  return open?id:current===id?null:current;
}
