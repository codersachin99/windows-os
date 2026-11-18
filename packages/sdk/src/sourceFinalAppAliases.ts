/**
 * Source: legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776
 * src/config/app.registry.json (final user-locked baseline).
 *
 * These are exact source aliases. The app registry only activates aliases
 * where a real React AppDefinition is registered; absent source apps (Paint,
 * mouse, region, sound, etc.) must NOT be registered as pretend programs.
 *
 * Computer's special folder aliases (documents/music/pictures) require an
 * Explorer initial-path contract before being activated; `explorer` alone
 * safely targets the Computer window. The original Run command parser
 * continues to use sourcePrograms for installed executable path matching.
 */
export const SOURCE_FINAL_APP_ALIASES:Readonly<Record<string,readonly string[]>>=
  Object.freeze({
    calc:["calculator"],
    paint:["mspaint"],
    snipping:["snippingtool"],
    sticky:["notes","stickynotes"],
    player:["wmplayer"],
    about:["winver"],
    computer:["explorer","documents","music","pictures"],
    cpanel:["control"],
    mouse:["main.cpl"],
    personalize:["desk.cpl"],
    region:["intl.cpl"],
    sound:["mmsys.cpl"],
    system:["sysdm.cpl"]
  });
/** Only aliases whose launch semantics the React app currently implements. */
const SAFE_LAUNCH_ALIASES=new Set([
  "calculator","snippingtool","notes","stickynotes","wmplayer",
  "winver","explorer","control","desk.cpl","sysdm.cpl"
]);
export function sourceRegisteredAliases(id:string):readonly string[]{
  return (SOURCE_FINAL_APP_ALIASES[id]??[]).filter(alias=>
    SAFE_LAUNCH_ALIASES.has(alias));
}
