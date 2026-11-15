import {describe,it,expect} from "vitest";
import {
  SOURCE_TRAY_ITEMS,sourceDefaultTrayPreferences,sourceTrayVisible,
  sourceTrayHidden,sourceTraySetBehavior,sourceTrayRestoreDefaults
} from "./notification";

describe("original source taskbar-base.js bc55 tray defaults and selectors",()=>{
  it("mirrors four source tray records and initial settings",()=>{
    const prefs=sourceDefaultTrayPreferences();
    expect(SOURCE_TRAY_ITEMS.map(item=>item.id)).toEqual([
      "TaskbarActionCenter","TaskbarNetwork","TaskbarBattery","TaskbarVolume"
    ]);
    expect(prefs.alwaysShowIcons).toBe(false);
    expect(prefs.showClockIcon).toBe(true);
    expect(sourceTrayVisible(prefs)).toEqual(SOURCE_TRAY_ITEMS.map(item=>item.id));
    expect(sourceTrayHidden(prefs)).toEqual([]);
  });
  it("preserves original shown, hidden, notifications-only and off selectors",()=>{
    let prefs=sourceDefaultTrayPreferences();
    prefs=sourceTraySetBehavior(prefs,"TaskbarVolume","hidden");
    prefs=sourceTraySetBehavior(prefs,"TaskbarNetwork","notifications-only");
    prefs=sourceTraySetBehavior(prefs,"TaskbarBattery","off");
    expect(sourceTrayVisible(prefs)).toEqual(["TaskbarActionCenter"]);
    expect(sourceTrayHidden(prefs)).toEqual(["TaskbarNetwork","TaskbarVolume"]);
    expect(sourceTrayVisible({...prefs,alwaysShowIcons:true}))
      .toEqual(["TaskbarActionCenter","TaskbarNetwork","TaskbarVolume"]);
    expect(sourceTrayHidden({...prefs,alwaysShowIcons:true})).toEqual([]);
  });
  it("restore only replaces icon behaviors (original Vuex action)",()=>{
    const modified={
      ...sourceDefaultTrayPreferences(),alwaysShowIcons:true,showClockIcon:false
    };
    const before=sourceTraySetBehavior(modified,"TaskbarVolume","off");
    const restored=sourceTrayRestoreDefaults(before);
    expect(restored.icons).toEqual(sourceDefaultTrayPreferences().icons);
    expect(restored.alwaysShowIcons).toBe(true);
    expect(restored.showClockIcon).toBe(false);
    expect(before.icons.TaskbarVolume).toBe("off");
  });
});
