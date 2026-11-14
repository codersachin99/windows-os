import {describe,it,expect} from "vitest";
import {sourceShortcutIconValue} from "./sourceShortcutIcons";

describe("pinned computer.js.describe shortcut icon JSON",()=>{
  it("uses icon field independently of the exe target",()=>{
    expect(sourceShortcutIconValue('{"exe":"notepad","icon":"calc"}')).toBe("calc");
    expect(sourceShortcutIconValue('{"exe":"unknown","icon":"photo"}')).toBe("photo");
    expect(sourceShortcutIconValue('{"icon":"notepad"}')).toBe("notepad");
  });
  it("returns original file fallback for broken JSON, no invented icons for missing fields",()=>{
    expect(sourceShortcutIconValue("{bad")).toBe("file");
    expect(sourceShortcutIconValue('{"exe":"calc"}')).toBeNull();
    expect(sourceShortcutIconValue('{"icon":123}')).toBeNull();
    expect(sourceShortcutIconValue('{"icon":""}')).toBeNull();
    expect(sourceShortcutIconValue("null")).toBeNull();
  });
});
