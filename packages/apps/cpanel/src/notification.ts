/** Pinned legacy src/modules/shell/taskbar-base.js bc55.
 * Default tray items in source order ActionCenter, Network, Battery, Volume,
 * all "shown"; showClockIcon true; alwaysShowIcons false. The source
 * notification panel cpanel.js qe maps three behaviors and subpage on/off. */
export const SOURCE_TRAY_ITEMS=[
  {id:"TaskbarActionCenter",label:"Action Center",asset:"trayActionCenter"},
  {id:"TaskbarNetwork",label:"Network",asset:"trayNetwork"},
  {id:"TaskbarBattery",label:"Power",asset:"trayBattery"},
  {id:"TaskbarVolume",label:"Volume",asset:"trayVolume"}
] as const;
export type SourceTrayIconId=typeof SOURCE_TRAY_ITEMS[number]["id"];
export type SourceTrayBehavior="shown"|"hidden"|"notifications-only"|"off";
export type SourceTrayPreferences={
  alwaysShowIcons:boolean;
  showClockIcon:boolean;
  icons:Record<SourceTrayIconId,SourceTrayBehavior>;
};
export function sourceDefaultTrayPreferences():SourceTrayPreferences{
  return {
    alwaysShowIcons:false,showClockIcon:true,
    icons:{
      TaskbarActionCenter:"shown",
      TaskbarNetwork:"shown",
      TaskbarBattery:"shown",
      TaskbarVolume:"shown"
    }
  };
}
/** Source bc55 visibleItems, hiddenItems, enabledItems selectors. */
export function sourceTrayVisible(
  prefs:SourceTrayPreferences
):SourceTrayIconId[]{
  return SOURCE_TRAY_ITEMS.filter(item=>prefs.alwaysShowIcons
    ?prefs.icons[item.id]!=="off"
    :prefs.icons[item.id]==="shown").map(item=>item.id);
}
export function sourceTrayHidden(
  prefs:SourceTrayPreferences
):SourceTrayIconId[]{
  return prefs.alwaysShowIcons?[]:SOURCE_TRAY_ITEMS
    .filter(item=>prefs.icons[item.id]==="hidden"||
      prefs.icons[item.id]==="notifications-only").map(item=>item.id);
}
export function sourceTraySetBehavior(
  prefs:SourceTrayPreferences,id:SourceTrayIconId,behavior:SourceTrayBehavior
):SourceTrayPreferences{
  return {...prefs,icons:{...prefs.icons,[id]:behavior}};
}
/** RestoreDefaultIconBehaviors resets the original trayItems only:
 * clock and alwaysShowIcons are distinct Vuex state. */
export function sourceTrayRestoreDefaults(
  prefs:SourceTrayPreferences
):SourceTrayPreferences{
  return {...prefs,icons:sourceDefaultTrayPreferences().icons};
}
