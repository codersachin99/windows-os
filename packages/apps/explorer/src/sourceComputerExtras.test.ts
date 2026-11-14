import {describe,expect,it} from "vitest";
import {sourceComputerDetailsLabelWidth,sourceComputerFileType,sourceComputerItemExtras,
  SOURCE_COMPUTER_DETAILS_COLUMN_WIDTH,SOURCE_COMPUTER_DETAILS_ICON_WIDTH,
  SOURCE_COMPUTER_DETAILS_CHECKBOX_WIDTH} from "./sourceComputerExtras";
import {LegacyVolumeSession,VirtualFileStore,sourceGuestMounts,SOURCE_SYSTEM_DISK} from "@windows-os/filesystem";

const file={
  uri:"/Users/Guest/Documents/Project.v1.TXT",
  name:"Project.v1.TXT",
  type:"file" as const,
  mtime:Date.UTC(2026,10,14,12,30),
  size:42
};
const directory={
  ...file,uri:"/Users/Guest/Documents/Folder",name:"Folder",type:"directory" as const,size:0
};
const date=new Date(file.mtime).toLocaleString();

describe("pinned computer.js contentItems and getFileType",()=>{
  it("uses exact source Details widths including 24px touch-checkbox subtraction",()=>{
    expect(SOURCE_COMPUTER_DETAILS_COLUMN_WIDTH).toBe(220);
    expect(SOURCE_COMPUTER_DETAILS_ICON_WIDTH).toBe(16);
    expect(SOURCE_COMPUTER_DETAILS_CHECKBOX_WIDTH).toBe(24);
    expect(sourceComputerDetailsLabelWidth(false)).toBe(204);
    expect(sourceComputerDetailsLabelWidth(true)).toBe(180);
  });
  it("uses last-dot source extensions rather than invented Windows labels",()=>{
    expect(sourceComputerFileType(file)).toBe("TXT File");
    expect(sourceComputerFileType({...file,name:"archive.tar.gz"})).toBe("GZ File");
    expect(sourceComputerFileType({...file,name:".config"})).toBe("CONFIG File");
    expect(sourceComputerFileType({...file,name:"README"})).toBe("File folder");
    expect(sourceComputerFileType(directory)).toBe("File folder");
  });
  it("uses the exact source selection and order for regular files",()=>{
    expect(sourceComputerItemExtras(file,"details")).toEqual([date,"TXT File","42 bytes"]);
    expect(sourceComputerItemExtras(file,"tiles")).toEqual(["TXT File","42 bytes"]);
    expect(sourceComputerItemExtras(file,"content")).toEqual([date,"TXT File","42 bytes"]);
    expect(sourceComputerItemExtras(file,"list")).toEqual([]);
    expect(sourceComputerItemExtras(file,"extra-large-icons")).toEqual([]);
  });
  it("omits source Content folder type/size but preserves blank Details size",()=>{
    expect(sourceComputerItemExtras(directory,"details")).toEqual([date,"File folder",""]);
    expect(sourceComputerItemExtras(directory,"tiles")).toEqual(["File folder"]);
    expect(sourceComputerItemExtras(directory,"content")).toEqual([date]);
  });
  it("replaces Content extras with modified date/location/size on search",()=>{
    expect(sourceComputerItemExtras(file,"content",true)).toEqual([
      "Date modified: "+date,"/Users/Guest/Documents","Size: 42 bytes"
    ]);
    expect(sourceComputerItemExtras(directory,"content",true)).toEqual([
      "Date modified: "+date,"/Users/Guest/Documents"
    ]);
    expect(sourceComputerItemExtras(file,"details",true)).toEqual([date,"TXT File","42 bytes"]);
  });

  it("uses mounted C: drive locations in source Content search only",()=>{
    const volume=new LegacyVolumeSession(new VirtualFileStore(),sourceGuestMounts());
    const mounted={...file,uri:SOURCE_SYSTEM_DISK+"/Users/Guest/Documents/Project.v1.TXT"};
    expect(sourceComputerItemExtras(mounted,"content",true,volume)).toEqual([
      "Date modified: "+date,"C:\\Users\\Guest\\Documents","Size: 42 bytes"
    ]);
    expect(sourceComputerItemExtras(mounted,"content",false,volume)).toEqual([
      date,"TXT File","42 bytes"
    ]);
  });
});
