import {expect,test,type Page} from "@playwright/test";

const SOURCE_DESKTOP="/EXTERNAL/computer/drive0/Users/Guest/Desktop";
const artwork={
  winLS:{empty:"/assets/images/bin-winxp.7d0403fd.webp",full:"/assets/images/bin-full-winxp.ba3f6193.webp"},
  onebit:{empty:"/assets/images/bin-onebit.b4ba1ed0.svg",full:"/assets/images/bin-onebit.b4ba1ed0.svg"},
  winLP:{empty:"/assets/images/bin-winxp.7d0403fd.webp",full:"/assets/images/bin-full-winxp.ba3f6193.webp"},
  winW:{empty:"/assets/images/bin-winxp.7d0403fd.webp",full:"/assets/images/bin-full-winxp.ba3f6193.webp"},
  oxygen:{empty:"/assets/images/bin-oxygen.b6be9ff9.webp",full:"/assets/images/bin-full-oxygen.a82e7824.webp"},
  aeroNoir:{empty:"/assets/images/bin-aeroNoir.12b5ed31.svg",full:"/assets/images/bin-full-aeroNoir.6bcff3f1.webp"},
  kubuntu:{
    empty:"/assets/images/bin-kubuntu.9e105407.webp",
    full:"/assets/images/bin-full-kubuntu.52b4bff6.webp"
  },
  ubuntu:{
    empty:"/assets/images/bin-ubuntu.509f78ac.webp",
    full:"/assets/images/bin-full-ubuntu.2faf5a4b.webp"
  },
  chromeos:{
    empty:"/assets/images/bin-chromeos.6bccf38b.webp",
    full:"/assets/images/bin-chromeos.6bccf38b.webp"
  },
  macos:{
    empty:"/assets/images/bin-mac.499e907b.webp",
    full:"/assets/images/bin-full-mac.67e3d272.webp"
  },
  win95:{
    empty:"/assets/images/bin-win95.28a063bb.webp",
    full:"/assets/images/bin-full-win95.5b7aebde.webp"
  },
  win98:{
    empty:"/assets/images/bin-win95.28a063bb.webp",
    full:"/assets/images/bin-full-win95.5b7aebde.webp"
  },
  win2k:{
    empty:"/assets/images/bin-win2k.4b231417.webp",
    full:"/assets/images/bin-full-win2k.f2dd6793.webp"
  },
  win10:{
    empty:"/assets/images/bin-win10.e0f739cc.webp",
    full:"/assets/images/bin-full-win10.857c2cab.webp"
  },
  winxp:{
    empty:"/assets/images/bin-winxp.7d0403fd.webp",
    full:"/assets/images/bin-full-winxp.ba3f6193.webp"
  },
  win11:{
    empty:"/assets/images/bin-win11.73608517.webp",
    full:"/assets/images/bin-full-win11.de576bf3.webp"
  }
} as const;

async function sourceThemeDesktop(page:Page,theme:keyof typeof artwork){
  await page.goto("/?theme="+theme);
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await expect(page.locator('[data-test-main-screen]')).toHaveAttribute("data-theme",theme);
}

for(const theme of ["win95","win98","win2k","winxp","win10","win11","macos","chromeos","ubuntu","kubuntu","aeroNoir","oxygen","winLS","winLP","winW","onebit"] as const){
  test("original "+theme+" Recycle Bin artwork follows the actual Guest trash lifecycle",async({page})=>{
    await sourceThemeDesktop(page,theme);
    const icon=page.locator('[data-test-desktop-icon="bin"]');
    const image=icon.locator(".desktop__icon-icon");
    await expect(image).toHaveAttribute("src",artwork[theme].empty);

    const name="Source "+theme+" Bin Art.txt";
    await page.locator("[data-test-desktop-upload-input]").setInputFiles({
      name,mimeType:"text/plain",buffer:Buffer.from("original image lifecycle")
    });
    const file=page.locator('[data-test-desktop-file="'+SOURCE_DESKTOP+"/"+name+'"]');
    await expect(file).toBeVisible();
    await file.click({button:"right"});
    await page.locator('[data-test-desktop-item-action="delete"]').click();
    const deletion=page.getByRole("alertdialog",{name:"Confirm desktop deletion"});
    await deletion.getByRole("button",{name:"Yes"}).click();
    await expect(file).toHaveCount(0);
    await expect(image).toHaveAttribute("src",artwork[theme].full);

    await icon.dblclick();
    const bin=page.locator('[data-test-window="bin"]').last();
    await expect(bin.locator('[data-test-explorer-item="'+name+'"]')).toBeVisible();
    await expect(bin.locator(".explorer-navigation__home img").first())
      .toHaveAttribute("src",artwork[theme].full);
    await bin.getByRole("button",{name:/^Close /}).click();

    await icon.click({button:"right"});
    await page.locator('[data-test-desktop-item-action="empty-bin"]').click();
    const empty=page.getByRole("alertdialog",{name:"Confirm empty Recycle Bin"});
    await empty.getByRole("button",{name:"Yes"}).click();
    await expect(image).toHaveAttribute("src",artwork[theme].empty);
    if(theme==="chromeos"||theme==="onebit"){
      await icon.dblclick();
      await expect(page.locator('[data-test-window="bin"]').last().locator('[data-test-explorer-item="'+name+'"]')).toHaveCount(0);
    }
  });
}


test("original Win10 Computer and Desktop files use theme-specific folder/generic-file artwork",async({page})=>{
  await sourceThemeDesktop(page,"win10");
  const computerIcon=page.locator('[data-test-desktop-icon="computer"] .desktop__icon-icon');
  await expect(computerIcon).toHaveAttribute("src",
    "/assets/images/computer-win10.2212df79.webp");
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const explorer=page.locator('[data-test-window="computer"]').first();
  await expect(explorer).toBeVisible();
  await explorer.getByRole("button",{name:"Desktop",exact:true}).click();
  await expect(explorer.getByRole("textbox",{name:"Folder address"}))
    .toHaveValue(SOURCE_DESKTOP);
  await explorer.getByRole("button",{name:"New folder"}).click();
  const dialog=explorer.getByRole("dialog",{name:"New folder"});
  await dialog.getByRole("textbox",{name:"New folder name"})
    .fill("Win10 Source Folder");
  await dialog.getByRole("button",{name:"OK"}).click();
  const folder=page.locator('[data-test-desktop-file="'+SOURCE_DESKTOP+'/Win10 Source Folder"]');
  await expect(folder).toBeVisible();
  await expect(folder.locator(".desktop__icon-icon"))
    .toHaveAttribute("src","/assets/images/folder-win10.294665f0.webp");

  await explorer.locator('input[type="file"][aria-label="Upload files"]')
    .setInputFiles({name:"Source Unknown.abc",
      mimeType:"application/octet-stream",
      buffer:Buffer.from([0x31,0x32,0x33])});
  const unknown=page.locator('[data-test-desktop-file="'+SOURCE_DESKTOP+'/Source Unknown.abc"]');
  await expect(unknown).toBeVisible();
  await expect(unknown.locator(".desktop__icon-icon"))
    .toHaveAttribute("src","/assets/images/file-win10.036601ed.webp");

  await folder.dblclick();
  await expect(page.locator('[data-test-window="computer"]')).toHaveCount(2);
  const opened=page.locator('[data-test-window="computer"]').last();
  await expect(opened.getByRole("textbox",{name:"Folder address"}))
    .toHaveValue(SOURCE_DESKTOP+"/Win10 Source Folder");
});


test("original macOS Computer and Desktop files use theme-specific folder/generic-file artwork",async({page})=>{
  await sourceThemeDesktop(page,"macos");
  const computerIcon=page.locator('[data-test-desktop-icon="computer"] .desktop__icon-icon');
  await expect(computerIcon).toHaveAttribute("src",
    "/assets/images/computer-mac.4c6c5258.webp");
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const explorer=page.locator('[data-test-window="computer"]').first();
  await expect(explorer).toBeVisible();
  await expect(page.locator('[data-test-start-button] img')).toHaveAttribute("src","/assets/images/start-button-mac.db7da45a.webp");
  await expect(explorer.locator(".explorer-navigation__home").first().locator("img"))
    .toHaveAttribute("src","/assets/images/computer-mac.4c6c5258.webp");
  for(const [label,art] of [["Documents","/assets/images/folder-docs-mac.19ef120e.webp"],["Downloads","/assets/images/folder-downloads-mac.5a239779.webp"],["Music","/assets/images/folder-music-mac.8905b037.webp"],["Pictures","/assets/images/folder-pics-mac.dfca3097.webp"],["Videos","/assets/images/folder-videos-mac.7edd23bf.webp"]]){
    const shortcut=explorer.locator(".explorer-navigation__home").filter({hasText:label});
    await expect(shortcut.locator("img")).toHaveAttribute("src",art);
  }
  await explorer.getByRole("button",{name:"Desktop",exact:true}).click();
  await expect(explorer.getByRole("textbox",{name:"Folder address"}))
    .toHaveValue(SOURCE_DESKTOP);
  await explorer.getByRole("button",{name:"New folder"}).click();
  const dialog=explorer.getByRole("dialog",{name:"New folder"});
  await dialog.getByRole("textbox",{name:"New folder name"})
    .fill("macOS Source Folder");
  await dialog.getByRole("button",{name:"OK"}).click();
  const folder=page.locator('[data-test-desktop-file="'+SOURCE_DESKTOP+'/macOS Source Folder"]');
  await expect(folder).toBeVisible();
  await expect(folder.locator(".desktop__icon-icon"))
    .toHaveAttribute("src","/assets/images/folder-mac.248938aa.webp");

  await explorer.locator('input[type="file"][aria-label="Upload files"]')
    .setInputFiles({name:"Source Unknown.abc",
      mimeType:"application/octet-stream",
      buffer:Buffer.from([0x31,0x32,0x33])});
  const unknown=page.locator('[data-test-desktop-file="'+SOURCE_DESKTOP+'/Source Unknown.abc"]');
  await expect(unknown).toBeVisible();
  await expect(unknown.locator(".desktop__icon-icon"))
    .toHaveAttribute("src","/assets/images/file-mac.f9d8e370.webp");

  await folder.dblclick();
  await expect(page.locator('[data-test-window="computer"]')).toHaveCount(2);
  const opened=page.locator('[data-test-window="computer"]').last();
  await expect(opened.getByRole("textbox",{name:"Folder address"}))
    .toHaveValue(SOURCE_DESKTOP+"/macOS Source Folder");
});


test("original ChromeOS Computer and Desktop files use theme-specific folder/generic-file artwork",async({page})=>{
  await sourceThemeDesktop(page,"chromeos");
  const computerIcon=page.locator('[data-test-desktop-icon="computer"] .desktop__icon-icon');
  await expect(computerIcon).toHaveAttribute("src",
    "/assets/images/computer-chromeos.f4f817d9.webp");
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const explorer=page.locator('[data-test-window="computer"]').first();
  await expect(explorer).toBeVisible();
  await expect(page.locator('[data-test-start-button] img')).toHaveAttribute("src","/assets/images/start-button-win8.2e5214cc.svg");
  await expect(explorer.locator(".explorer-navigation__home").first().locator("img"))
    .toHaveAttribute("src","/assets/images/computer-chromeos.f4f817d9.webp");
  for(const [label,art] of [["Documents","/assets/images/folder-chromeos.fa700781.svg"],["Downloads","/assets/images/downloads-chromeos.729e50f7.svg"],["Music","/assets/images/folder-chromeos.fa700781.svg"],["Pictures","/assets/images/folder-chromeos.fa700781.svg"],["Videos","/assets/images/folder-chromeos.fa700781.svg"]]){
    const shortcut=explorer.locator(".explorer-navigation__home").filter({hasText:label});
    await expect(shortcut.locator("img")).toHaveAttribute("src",art);
  }
  const desktopShortcut=explorer.getByRole("button",{name:"Desktop",exact:true});
  await expect(desktopShortcut.locator("img")).toHaveAttribute("src","/assets/images/desktop-chromeos.26c36183.svg");
  await desktopShortcut.click();
  await expect(explorer.getByRole("textbox",{name:"Folder address"}))
    .toHaveValue(SOURCE_DESKTOP);
  await explorer.getByRole("button",{name:"New folder"}).click();
  const dialog=explorer.getByRole("dialog",{name:"New folder"});
  await dialog.getByRole("textbox",{name:"New folder name"})
    .fill("ChromeOS Source Folder");
  await dialog.getByRole("button",{name:"OK"}).click();
  const folder=page.locator('[data-test-desktop-file="'+SOURCE_DESKTOP+'/ChromeOS Source Folder"]');
  await expect(folder).toBeVisible();
  await expect(folder.locator(".desktop__icon-icon"))
    .toHaveAttribute("src","/assets/images/folder-chromeos.fa700781.svg");

  await explorer.locator('input[type="file"][aria-label="Upload files"]')
    .setInputFiles({name:"Source Unknown.abc",
      mimeType:"application/octet-stream",
      buffer:Buffer.from([0x31,0x32,0x33])});
  const unknown=page.locator('[data-test-desktop-file="'+SOURCE_DESKTOP+'/Source Unknown.abc"]');
  await expect(unknown).toBeVisible();
  await expect(unknown.locator(".desktop__icon-icon"))
    .toHaveAttribute("src","/assets/images/file-chromeos.c40dd66d.svg");

  await folder.dblclick();
  await expect(page.locator('[data-test-window="computer"]')).toHaveCount(2);
  const opened=page.locator('[data-test-window="computer"]').last();
  await expect(opened.getByRole("textbox",{name:"Folder address"}))
    .toHaveValue(SOURCE_DESKTOP+"/ChromeOS Source Folder");
});


test("original Ubuntu Computer and Desktop files use theme-specific folder/generic-file artwork",async({page})=>{
  await sourceThemeDesktop(page,"ubuntu");
  const computerIcon=page.locator('[data-test-desktop-icon="computer"] .desktop__icon-icon');
  await expect(computerIcon).toHaveAttribute("src",
    "/assets/images/computer-ubuntu.ab0d9786.webp");
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const explorer=page.locator('[data-test-window="computer"]').first();
  await expect(explorer).toBeVisible();
  await expect(page.locator('[data-test-start-button] img')).toHaveAttribute("src","/assets/images/start-button-ubuntu.a6d206e0.webp");
  await expect(explorer.locator(".explorer-navigation__home").first().locator("img"))
    .toHaveAttribute("src","/assets/images/computer-ubuntu.ab0d9786.webp");
  for(const [label,art] of [["Documents","/assets/images/folder-docs-ubuntu.d9b020ee.svg"],["Downloads","/assets/images/folder-downloads-ubuntu.367c96da.svg"],["Music","/assets/images/folder-music-ubuntu.c191048c.svg"],["Pictures","/assets/images/folder-pics-ubuntu.f0402adf.svg"],["Videos","/assets/images/folder-videos-ubuntu.c9f591cb.svg"]]){
    const shortcut=explorer.locator(".explorer-navigation__home").filter({hasText:label});
    await expect(shortcut.locator("img")).toHaveAttribute("src",art);
  }
  const desktopShortcut=explorer.getByRole("button",{name:"Desktop",exact:true});
  await expect(desktopShortcut.locator("img")).toHaveAttribute("src","/assets/images/desktop-ubuntu.ca166b4b.webp");
  await desktopShortcut.click();
  await expect(explorer.getByRole("textbox",{name:"Folder address"}))
    .toHaveValue(SOURCE_DESKTOP);
  await explorer.getByRole("button",{name:"New folder"}).click();
  const dialog=explorer.getByRole("dialog",{name:"New folder"});
  await dialog.getByRole("textbox",{name:"New folder name"})
    .fill("Ubuntu Source Folder");
  await dialog.getByRole("button",{name:"OK"}).click();
  const folder=page.locator('[data-test-desktop-file="'+SOURCE_DESKTOP+'/Ubuntu Source Folder"]');
  await expect(folder).toBeVisible();
  await expect(folder.locator(".desktop__icon-icon"))
    .toHaveAttribute("src","/assets/images/folder-ubuntu.73afbe73.svg");

  await explorer.locator('input[type="file"][aria-label="Upload files"]')
    .setInputFiles({name:"Source Unknown.abc",
      mimeType:"application/octet-stream",
      buffer:Buffer.from([0x31,0x32,0x33])});
  const unknown=page.locator('[data-test-desktop-file="'+SOURCE_DESKTOP+'/Source Unknown.abc"]');
  await expect(unknown).toBeVisible();
  await expect(unknown.locator(".desktop__icon-icon"))
    .toHaveAttribute("src","/assets/images/file-ubuntu.2f731416.svg");

  await folder.dblclick();
  await expect(page.locator('[data-test-window="computer"]')).toHaveCount(2);
  const opened=page.locator('[data-test-window="computer"]').last();
  await expect(opened.getByRole("textbox",{name:"Folder address"}))
    .toHaveValue(SOURCE_DESKTOP+"/Ubuntu Source Folder");
});


test("original Kubuntu Computer and Desktop files use theme-specific folder/generic-file artwork",async({page})=>{
  await sourceThemeDesktop(page,"kubuntu");
  const computerIcon=page.locator('[data-test-desktop-icon="computer"] .desktop__icon-icon');
  await expect(computerIcon).toHaveAttribute("src",
    "/assets/images/computer-kubuntu.21e2af5f.svg");
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const explorer=page.locator('[data-test-window="computer"]').first();
  await expect(explorer).toBeVisible();
  await expect(page.locator('[data-test-start-button] img')).toHaveAttribute("src","/assets/images/start-button-kubuntu.70b91e6e.svg");
  await expect(explorer.locator(".explorer-navigation__home").first().locator("img"))
    .toHaveAttribute("src","/assets/images/computer-kubuntu.21e2af5f.svg");
  for(const [label,art] of [["Documents","/assets/images/folder-docs-kubuntu.bc09a419.svg"],["Downloads","/assets/images/folder-download-kubuntu.3ddfc03d.svg"],["Music","/assets/images/folder-music-kubuntu.bdd260b5.svg"],["Pictures","/assets/images/folder-pics-kubuntu.372cdadd.svg"],["Videos","/assets/images/folder-videos-ubuntu.c9f591cb.svg"]]){
    const shortcut=explorer.locator(".explorer-navigation__home").filter({hasText:label});
    await expect(shortcut.locator("img")).toHaveAttribute("src",art);
  }
  const desktopShortcut=explorer.getByRole("button",{name:"Desktop",exact:true});
  await expect(desktopShortcut.locator("img")).toHaveAttribute("src","/assets/images/desktop-kubuntu.caba3657.webp");
  await desktopShortcut.click();
  await expect(explorer.getByRole("textbox",{name:"Folder address"}))
    .toHaveValue(SOURCE_DESKTOP);
  await explorer.getByRole("button",{name:"New folder"}).click();
  const dialog=explorer.getByRole("dialog",{name:"New folder"});
  await dialog.getByRole("textbox",{name:"New folder name"})
    .fill("Kubuntu Source Folder");
  await dialog.getByRole("button",{name:"OK"}).click();
  const folder=page.locator('[data-test-desktop-file="'+SOURCE_DESKTOP+'/Kubuntu Source Folder"]');
  await expect(folder).toBeVisible();
  await expect(folder.locator(".desktop__icon-icon"))
    .toHaveAttribute("src","/assets/images/computer-kubuntu.21e2af5f.svg");

  await explorer.locator('input[type="file"][aria-label="Upload files"]')
    .setInputFiles({name:"Source Unknown.abc",
      mimeType:"application/octet-stream",
      buffer:Buffer.from([0x31,0x32,0x33])});
  const unknown=page.locator('[data-test-desktop-file="'+SOURCE_DESKTOP+'/Source Unknown.abc"]');
  await expect(unknown).toBeVisible();
  await expect(unknown.locator(".desktop__icon-icon"))
    .toHaveAttribute("src","/assets/images/file-kubuntu.7dae3497.webp");

  await folder.dblclick();
  await expect(page.locator('[data-test-window="computer"]')).toHaveCount(2);
  const opened=page.locator('[data-test-window="computer"]').last();
  await expect(opened.getByRole("textbox",{name:"Folder address"}))
    .toHaveValue(SOURCE_DESKTOP+"/Kubuntu Source Folder");
});

test("original Aero Noir Computer and Desktop files use theme-specific folder/generic-file artwork",async({page})=>{
  await sourceThemeDesktop(page,"aeroNoir");
  const computerIcon=page.locator('[data-test-desktop-icon="computer"] .desktop__icon-icon');
  await expect(computerIcon).toHaveAttribute("src",
    "/assets/images/computer-aeroNoir.1a117c0c.webp");
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const explorer=page.locator('[data-test-window="computer"]').first();
  await expect(explorer).toBeVisible();

  await expect(explorer.locator(".explorer-navigation__home").first().locator("img"))
    .toHaveAttribute("src","/assets/images/computer-aeroNoir.1a117c0c.webp");
  for(const [label,art] of [["Documents","/assets/images/folder-docs-aeroNoir.e177413f.svg"],["Downloads","/assets/images/folder-downloads-aeroNoir.95a9aee9.svg"],["Music","/assets/images/folder-aeroNoir.0a237526.svg"],["Pictures","/assets/images/folder-aeroNoir.0a237526.svg"],["Videos","/assets/images/folder-aeroNoir.0a237526.svg"]]){
    const shortcut=explorer.locator(".explorer-navigation__home").filter({hasText:label});
    await expect(shortcut.locator("img")).toHaveAttribute("src",art);
  }
  const desktopShortcut=explorer.getByRole("button",{name:"Desktop",exact:true});
  await expect(desktopShortcut.locator("img")).toHaveAttribute("src","/assets/images/desktop-aeroNoir.3821791a.svg");
  await desktopShortcut.click();
  await expect(explorer.getByRole("textbox",{name:"Folder address"}))
    .toHaveValue(SOURCE_DESKTOP);
  await explorer.getByRole("button",{name:"New folder"}).click();
  const dialog=explorer.getByRole("dialog",{name:"New folder"});
  await dialog.getByRole("textbox",{name:"New folder name"})
    .fill("Aero Noir Source Folder");
  await dialog.getByRole("button",{name:"OK"}).click();
  const folder=page.locator('[data-test-desktop-file="'+SOURCE_DESKTOP+'/Aero Noir Source Folder"]');
  await expect(folder).toBeVisible();
  await expect(folder.locator(".desktop__icon-icon"))
    .toHaveAttribute("src","/assets/images/folder-aeroNoir.0a237526.svg");

  await explorer.locator('input[type="file"][aria-label="Upload files"]')
    .setInputFiles({name:"Source Unknown.abc",
      mimeType:"application/octet-stream",
      buffer:Buffer.from([0x31,0x32,0x33])});
  const unknown=page.locator('[data-test-desktop-file="'+SOURCE_DESKTOP+'/Source Unknown.abc"]');
  await expect(unknown).toBeVisible();
  await expect(unknown.locator(".desktop__icon-icon"))
    .toHaveAttribute("src","/assets/images/file-aeroNoir.a9c655e6.svg");

  await folder.dblclick();
  await expect(page.locator('[data-test-window="computer"]')).toHaveCount(2);
  const opened=page.locator('[data-test-window="computer"]').last();
  await expect(opened.getByRole("textbox",{name:"Folder address"}))
    .toHaveValue(SOURCE_DESKTOP+"/Aero Noir Source Folder");
});

test("original Oxygen Computer and Desktop files use theme-specific folder/generic-file artwork",async({page})=>{
  await sourceThemeDesktop(page,"oxygen");
  const computerIcon=page.locator('[data-test-desktop-icon="computer"] .desktop__icon-icon');
  await expect(computerIcon).toHaveAttribute("src",
    "/assets/images/computer-oxygen.d170989c.webp");
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const explorer=page.locator('[data-test-window="computer"]').first();
  await expect(explorer).toBeVisible();

  await expect(explorer.locator(".explorer-navigation__home").first().locator("img"))
    .toHaveAttribute("src","/assets/images/computer-oxygen.d170989c.webp");
  for(const [label,art] of [["Documents","/assets/images/folder-docs-oxygen.c90421ab.webp"],["Downloads","/assets/images/folder-oxygen.b048f163.webp"],["Music","/assets/images/folder-music-oxygen.cd81f2bb.webp"],["Pictures","/assets/images/folder-pics-oxygen.4782ad04.webp"]]){
    const shortcut=explorer.locator(".explorer-navigation__home").filter({hasText:label});
    await expect(shortcut.locator("img")).toHaveAttribute("src",art);
  }
  const desktopShortcut=explorer.getByRole("button",{name:"Desktop",exact:true});
  await expect(desktopShortcut.locator("img")).toHaveAttribute("src","/assets/images/desktop-oxygen.d7075bf2.webp");
  await desktopShortcut.click();
  await expect(explorer.getByRole("textbox",{name:"Folder address"}))
    .toHaveValue(SOURCE_DESKTOP);
  await explorer.getByRole("button",{name:"New folder"}).click();
  const dialog=explorer.getByRole("dialog",{name:"New folder"});
  await dialog.getByRole("textbox",{name:"New folder name"})
    .fill("Oxygen Source Folder");
  await dialog.getByRole("button",{name:"OK"}).click();
  const folder=page.locator('[data-test-desktop-file="'+SOURCE_DESKTOP+'/Oxygen Source Folder"]');
  await expect(folder).toBeVisible();
  await expect(folder.locator(".desktop__icon-icon"))
    .toHaveAttribute("src","/assets/images/folder-oxygen.b048f163.webp");

  await explorer.locator('input[type="file"][aria-label="Upload files"]')
    .setInputFiles({name:"Source Unknown.abc",
      mimeType:"application/octet-stream",
      buffer:Buffer.from([0x31,0x32,0x33])});
  const unknown=page.locator('[data-test-desktop-file="'+SOURCE_DESKTOP+'/Source Unknown.abc"]');
  await expect(unknown).toBeVisible();
  await expect(unknown.locator(".desktop__icon-icon"))
    .toHaveAttribute("src","/assets/images/file-oxygen.7a4e1a22.webp");

  await folder.dblclick();
  await expect(page.locator('[data-test-window="computer"]')).toHaveCount(2);
  const opened=page.locator('[data-test-window="computer"]').last();
  await expect(opened.getByRole("textbox",{name:"Folder address"}))
    .toHaveValue(SOURCE_DESKTOP+"/Oxygen Source Folder");
});

for(const [theme,start] of Object.entries({"winxp":"/assets/images/start-button-winxp.a3485adf.webp","winLS":"/assets/images/start-button-winxp.a3485adf.webp","winLP":"/assets/images/start-button-winL.bcbc8d89.webp","winW":"/assets/images/start-button-win2k.650d501c.webp"}) as ["winxp"|"winLS"|"winLP"|"winW",string][]){
  test("original "+theme+" shared XP core artwork and distinct Start",async({page})=>{
    await sourceThemeDesktop(page,theme);
    await expect(page.locator('[data-test-start-button] img')).toHaveAttribute("src",start);
    await expect(page.locator('[data-test-desktop-icon="computer"] .desktop__icon-icon')).toHaveAttribute("src","/assets/images/computer-winxp.8cbae9da.webp");
    await page.locator('[data-test-desktop-icon="computer"]').dblclick();
    const explorer=page.locator('[data-test-window="computer"]').first();
    await expect(explorer).toBeVisible();
    for(const [label,art] of [["Documents","/assets/images/folder-docs-winxp.a303ce2a.webp"],["Downloads","/assets/images/folder-winxp.ff1b00c5.webp"],["Music","/assets/images/folder-music-winxp.dc009194.webp"],["Pictures","/assets/images/folder-pics-winxp.05398ea9.webp"],["Videos","/assets/images/folder-videos-winxp.c38aba27.webp"]]){
      await expect(explorer.locator(".explorer-navigation__home").filter({hasText:label}).locator("img")).toHaveAttribute("src",art);
    }
    const desktop=explorer.getByRole("button",{name:"Desktop",exact:true});
    await expect(desktop.locator("img")).toHaveAttribute("src","/assets/images/desktop-winxp.da2acd23.webp");
    await desktop.click();
    await expect(explorer.getByRole("textbox",{name:"Folder address"})).toHaveValue(SOURCE_DESKTOP);
    await explorer.getByRole("button",{name:"New folder"}).click();
    const dialog=explorer.getByRole("dialog",{name:"New folder"});
    await dialog.getByRole("textbox",{name:"New folder name"}).fill("Original "+theme+" Folder");
    await dialog.getByRole("button",{name:"OK"}).click();
    await expect(page.locator('[data-test-desktop-file="'+SOURCE_DESKTOP+'/Original '+theme+' Folder"] .desktop__icon-icon')).toHaveAttribute("src","/assets/images/folder-winxp.ff1b00c5.webp");
  });
}


test("Vista uses all source shell overrides without changing shared Computer artwork",async({page})=>{
  await page.goto("/?theme=winvista");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await expect(page.locator('[data-test-main-screen]')).toHaveAttribute("data-theme","winvista");
  await expect(page.locator('[data-test-start-button] img')).toHaveAttribute("src","/assets/images/start-button-winvista.f48c809a.webp");
  await expect(page.locator('[data-test-desktop-icon="computer"] .desktop__icon-icon')).toHaveAttribute("src","/assets/images/computer.f1f7f519.webp");
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const explorer=page.locator('[data-test-window="computer"]').first();
  await expect(explorer).toBeVisible();
  for(const [label,art] of [["Documents","/assets/images/folder-docs-winvista.d37b911b.webp"],["Downloads","/assets/images/folder-downloads-winvista.e9a11f63.webp"],["Music","/assets/images/folder-music-winvista.f77b8b67.webp"],["Pictures","/assets/images/folder-pics-winvista.73e408b9.webp"],["Videos","/assets/images/folder-videos-winvista.e4bb726b.webp"]]){
    await expect(explorer.locator(".explorer-navigation__home").filter({hasText:label}).locator("img")).toHaveAttribute("src",art);
  }
  for(const path of ["/assets/images/calc-winvista.46d50b40.webp","/assets/images/cpanel-winvista.aee2401a.webp","/assets/images/folder-docs-winvista.d37b911b.webp","/assets/images/folder-downloads-winvista.e9a11f63.webp","/assets/images/folder-music-winvista.f77b8b67.webp","/assets/images/folder-pics-winvista.73e408b9.webp","/assets/images/folder-videos-winvista.e4bb726b.webp","/assets/images/gadgets-winvista.9645eb0d.webp","/assets/images/paint-winvista.2f8923fc.webp","/assets/images/start-button-winvista.f48c809a.webp","/assets/images/sticky-winvista.2eb5a2ad.webp"]){
    const response=await page.request.get(path);
    expect(response.ok(),path).toBeTruthy();
    expect(response.headers()["content-type"],path).toContain("image/webp");
  }
});


test("Onebit uses the original shared monochrome icons for Guest folders and files",async({page})=>{
  await sourceThemeDesktop(page,"onebit");
  await expect(page.locator('[data-test-start-button] img')).toHaveAttribute("src","/assets/images/start-onebit.76d1ba55.svg");
  await expect(page.locator('[data-test-desktop-icon="computer"] .desktop__icon-icon')).toHaveAttribute("src","/assets/images/computer-onebit.ce54e8ef.svg");
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const explorer=page.locator('[data-test-window="computer"]').first();
  await expect(explorer).toBeVisible();
  for(const label of ["Documents","Downloads","Music","Pictures","Videos"]){
    await expect(explorer.locator(".explorer-navigation__home").filter({hasText:label}).locator("img")).toHaveAttribute("src","/assets/images/folder-onebit.11d8e8ae.svg");
  }
  const desktop=explorer.getByRole("button",{name:"Desktop",exact:true});
  await expect(desktop.locator("img")).toHaveAttribute("src","/assets/images/desktop-onebit.1ee5fa8d.svg");
  await desktop.click();
  await expect(explorer.getByRole("textbox",{name:"Folder address"})).toHaveValue(SOURCE_DESKTOP);
  await explorer.getByRole("button",{name:"New folder"}).click();
  const dialog=explorer.getByRole("dialog",{name:"New folder"});
  await dialog.getByRole("textbox",{name:"New folder name"}).fill("Onebit Source Folder");
  await dialog.getByRole("button",{name:"OK"}).click();
  await expect(page.locator('[data-test-desktop-file="'+SOURCE_DESKTOP+'/Onebit Source Folder"] .desktop__icon-icon')).toHaveAttribute("src","/assets/images/folder-onebit.11d8e8ae.svg");
  await explorer.locator('input[type="file"][aria-label="Upload files"]').setInputFiles({name:"Onebit Unknown.abc",mimeType:"application/octet-stream",buffer:Buffer.from([0x31])});
  await expect(page.locator('[data-test-desktop-file="'+SOURCE_DESKTOP+'/Onebit Unknown.abc"] .desktop__icon-icon')).toHaveAttribute("src","/assets/images/file-onebit.86e331c1.svg");
  for(const path of ["/assets/images/computer-onebit.ce54e8ef.svg","/assets/images/bin-onebit.b4ba1ed0.svg","/assets/images/folder-onebit.11d8e8ae.svg","/assets/images/file-onebit.86e331c1.svg","/assets/images/start-onebit.76d1ba55.svg","/assets/images/disk-onebit.f548a0b4.svg","/assets/images/calc-onebit.7ec329f9.svg","/assets/images/cpanel-onebit.97f4504b.svg","/assets/images/notepad-onebit.b01fbf08.svg","/assets/images/cmd-onebit.79f55a17.svg","/assets/images/text-onebit.885050ef.svg","/assets/images/default-onebit.aa73533f.svg","/assets/images/shortcut-onebit.25a406da.svg","/assets/images/media-onebit.e7e32a4b.svg","/assets/images/zip-onebit.75fd7aa6.svg","/assets/images/desktop-onebit.1ee5fa8d.svg","/assets/images/power-onebit.9672be1f.svg"]){
    const response=await page.request.get(path);
    expect(response.ok(),path).toBeTruthy();
    expect(response.headers()["content-type"],path).toContain("image/svg+xml");
  }
});


test("original XP registry remaining artwork is available as exact WebP files",async({page})=>{
  await sourceThemeDesktop(page,"winxp");
  for(const filename of ["about-winxp.4d3ad58f.webp","access-winxp.c88ef204.webp","arrow-winxp.b58eda4d.webp","accounts-winxp.f09bda44.webp","battery-charging-winxp.321f84b7.webp","help-winxp.6b449d71.webp","keyboard-winxp.648c2cdc.webp","mouse-winxp.c5534a40.webp","network-off-winxp.60414007.webp","sound-winxp.1ff35c0e.webp","volume-muted-winxp.70d8b244.webp","search-winxp.92dbc7ef.webp","speech-winxp.a5b18330.webp","system-winxp.74879c1e.webp","update-winxp.85628670.webp"]){
    const response=await page.request.get("/assets/images/"+filename);
    expect(response.ok(),filename).toBeTruthy();
    expect(response.headers()["content-type"],filename).toContain("image/webp");
  }
});


// Frozen Longhorn/Whistler source desktop selection + taskbar state rules.
for(const [theme,base,selection,active] of [
  ["winLP","rgb(80, 135, 217)","rgb(132, 185, 236)","rgb(117, 190, 237)"],
  ["winLS","rgb(79, 78, 80)","rgb(241, 193, 138)","rgb(117, 190, 237)"],
  ["winW","rgb(244, 244, 240)","rgb(0, 78, 152)","rgb(166, 207, 255)"]
] as const){
  test(theme+" source desktop selection and active taskbar palette",async({page})=>{
    await sourceThemeDesktop(page,theme);
    const bar=page.locator('[data-test-taskbar="base"]');
    await expect(bar).toHaveCSS("background-color",base);
    await expect(bar).toHaveCSS("backdrop-filter","none");
    if(theme!=="winW")await expect(bar).toHaveCSS("background-image",/linear-gradient/);
    else await expect(bar.locator(".windows-taskbar__clock")).toHaveCSS("color","rgb(0, 0, 0)");
    const icon=page.locator('[data-test-desktop-icon="computer"]');
    await icon.click();
    await expect(icon).toHaveClass(/is-active/);
    await expect(icon).toHaveCSS("background-color","rgba(0, 0, 0, 0)");
    await expect(icon.locator(".desktop__icon-name")).toHaveCSS("background-color",selection);
    await icon.dblclick();
    await expect(page.locator('[data-test-window="computer"]').first()).toBeVisible();
    await page.mouse.move(1,1);
    const item=bar.locator(".windows-taskbar__application.is-active");
    await expect(item).toHaveCount(1);
    await expect(item).toHaveCSS("background-color",active);
    await expect(item).toHaveCSS("box-shadow",/inset/);
  });
}


for(const [theme,left,right,radius] of [
  ["winLP","rgb(66, 113, 178)","rgb(61, 101, 158)","0px"],
  ["winLS","rgb(255, 255, 255)","rgb(255, 247, 230)","6px"],
  ["winW","rgb(255, 255, 255)","rgba(0, 0, 0, 0)","0px"]
] as const){
  test(theme+" uses the original XP-style Start panel palette and power actions",async({page})=>{
    await sourceThemeDesktop(page,theme);
    await page.locator("[data-test-start-button]").click();
    const menu=page.locator("[data-test-start-menu]");
    await expect(menu).toHaveClass(/windows-startmenu--winxp/);
    await expect(menu).toHaveCSS("border-top-left-radius",radius);
    await expect(menu.locator(".windows-startmenu__left")).toHaveCSS("background-color",left);
    await expect(menu.locator(".windows-startmenu__right")).toHaveCSS("background-color",right);
    await expect(menu.locator("[data-test-startmenu-xp-header] img")).toHaveCount(theme==="winW"?0:1);
    await expect(menu.locator("[data-test-startmenu-search]")).toHaveCount(0);
    const footer=menu.locator("[data-test-startmenu-xp-footer]");
    await expect(footer.getByRole("button",{name:"Restart",exact:true}).locator("img")).toHaveAttribute("src","/assets/images/restart-winxp.3e97eeb0.webp");
    await expect(footer.getByRole("button",{name:"Log off",exact:true})).toBeVisible();
    await expect(footer.getByRole("button",{name:"Turn off computer",exact:true})).toBeVisible();
    await menu.locator("[data-test-all-programs]").click();
    await expect(page.locator("[data-test-historical-programs-flyout]")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("[data-test-historical-programs-flyout]")).toHaveCount(0);
    await menu.getByRole("button",{name:"Computer",exact:true}).last().click();
    await expect(page.locator('[data-test-window="computer"]').first()).toBeVisible();
  });
}


for(const [theme,radius,activeColor,buttonColor] of [
  ["winLP","10px","rgb(80, 135, 217)","rgb(87, 134, 195)"],
  ["winLS","8px","rgb(79, 78, 80)","rgb(255, 255, 255)"],
  ["winW","0px","rgb(53, 115, 214)","rgb(255, 255, 255)"]
] as const){
  test(theme+" original frame and control styles follow Guest window lifecycle",async({page})=>{
    await sourceThemeDesktop(page,theme);
    await page.locator('[data-test-desktop-icon="computer"]').dblclick();
    const win=page.locator('[data-test-window="computer"]').first();
    await expect(win).toHaveAttribute("data-source-window-active","true");
    await expect(win).toHaveCSS("border-top-left-radius",radius);
    await expect(win).toHaveCSS("background-color",activeColor);
    await expect(win).toHaveCSS("background-image",theme==="winW"?/data:image\/png;base64/:/linear-gradient/);
    const caption=win.locator(".windows-window__titlebar");
    await expect(caption).toHaveCSS("opacity","1");
    await expect(win.locator(".windows-window__title")).toHaveCSS("color","rgb(255, 255, 255)");
    const max=win.locator('[data-source-window-control="maximize"]');
    await expect(max).toHaveCSS("width","20px");
    await expect(max).toHaveCSS("height","20px");
    await expect(max).toHaveCSS("color",buttonColor);
    await max.click();
    await expect(win).toHaveClass(/is-maximized/);
    await expect(win).toHaveCSS("border-top-left-radius","0px");
    await expect(win).toHaveCSS("padding-top","0px");
    await win.locator('[data-source-window-control="restore"]').click();
    await expect(win).not.toHaveClass(/is-maximized/);
    await expect(win).toHaveCSS("border-top-left-radius",radius);
    await win.locator('[data-source-window-control="minimize"]').click();
    await expect(win).toHaveCount(0);
    const button=page.locator('[data-test-taskbar-pin="computer"][data-test-taskbar-pin-running="true"],[data-test-taskbar-running-group="computer"]');
    await button.first().click();
    await expect(win).toBeVisible();
    await win.locator('[data-source-window-control="close"]').click();
    await expect(win).toHaveCount(0);
  });
}


for(const [theme,border,hover,textColor] of [
  ["winLP","rgb(65, 101, 159)","rgb(44, 104, 161)","rgb(255, 255, 255)"],
  ["winLS","rgb(124, 124, 124)","rgb(201, 200, 203)","rgb(0, 0, 0)"],
  ["winW","rgb(144, 144, 144)","rgb(56, 101, 154)","rgb(0, 0, 0)"]
] as const){
  test(theme+" original context skins on Desktop, Explorer and Start portal",async({page})=>{
    await sourceThemeDesktop(page,theme);
    const paint=async(menu:ReturnType<Page["locator"]>)=>{
      await expect(menu).toBeVisible();
      await expect(menu).toHaveCSS("border-top-color",border);
      await expect(menu).toHaveCSS("border-top-left-radius","0px");
      await expect(menu).toHaveCSS("color",textColor);
      if(theme==="winLP")await expect(menu).toHaveCSS("background-image",/linear-gradient/);
      else await expect(menu).toHaveCSS("background-color","rgb(255, 255, 255)");
    };
    await page.locator("#desktop-icons").click({button:"right",position:{x:260,y:200}});
    const root=page.locator("[data-test-desktop-menu]");
    await paint(root);
    const refresh=root.getByRole("menuitem",{name:"Refresh"});
    await refresh.hover();
    await expect(refresh).toHaveCSS("border-top-color",hover);
    await page.keyboard.press("Escape");
    await expect(root).toHaveCount(0);
    await page.locator('[data-test-desktop-icon="computer"]').dblclick();
    const win=page.locator('[data-test-window="computer"]').first();
    const content=win.locator(".explorer-content");
    const bounds=await content.boundingBox();
    expect(bounds).not.toBeNull();
    await content.click({button:"right",position:{x:Math.max(10,bounds!.width-12),y:Math.max(10,bounds!.height-12)}});
    const menu=win.locator('[data-test-explorer-context="background"]');
    await paint(menu);
    const view=menu.locator("[data-test-explorer-context-view]");
    await view.hover();
    await expect(view).toHaveCSS("border-top-color",hover);
    await view.click();
    const child=menu.locator("[data-test-explorer-background-submenu]");
    await paint(child);
    await expect(child.getByRole("menuitemradio")).toHaveCount(8);
    await page.keyboard.press("Escape");
    await expect(menu).toHaveCount(0);
    await win.locator('[data-source-window-control="close"]').click();
    await page.locator("[data-test-start-button]").click();
    const start=page.locator("[data-test-start-menu]");
    await start.locator('[data-test-program="notepad"]').first().click({button:"right"});
    const popup=page.locator('body > [data-test-start-program-context="notepad"]');
    await paint(popup);
    const pin=popup.locator('[data-test-start-context-action="pin"]');
    await pin.hover();
    await expect(pin).toHaveCSS("border-top-color",hover);
    await pin.click();
    await expect(page.locator('[data-test-taskbar-pin="notepad"]')).toBeVisible();
  });
}


for(const [theme,status,selectionBorder] of [
  ["winLP","rgb(217, 230, 244)","rgb(122, 154, 204)"],
  ["winLS","rgb(234, 232, 234)","rgb(236, 221, 204)"],
  ["winW","rgb(235, 235, 228)","rgba(0, 0, 0, 0)"]
] as const){
  test(theme+" original Explorer chrome tracks real history and item selection",async({page})=>{
    await sourceThemeDesktop(page,theme);
    await page.locator('[data-test-desktop-icon="computer"]').dblclick();
    const win=page.locator('[data-test-window="computer"]').first();
    const address=win.locator(".explorer-address");
    const back=win.getByRole("button",{name:"Back",exact:true});
    const forward=win.getByRole("button",{name:"Forward",exact:true});
    await expect(back).toBeDisabled();
    await expect(win.locator(".explorer-navigation")).toHaveCSS("background-color","rgb(255, 255, 255)");
    await expect(win.locator(".explorer-status")).toHaveCSS("background-color",status);
    if(theme==="winLP")await expect(address).toHaveCSS("background-image",/linear-gradient/);
    if(theme==="winLS")await expect(address).toHaveCSS("background-image","none");
    if(theme==="winW")await expect(address).toHaveCSS("background-color",status);
    await win.getByRole("button",{name:"Desktop",exact:true}).click();
    const location=win.getByRole("textbox",{name:"Folder address"});
    await expect(location).toHaveValue(SOURCE_DESKTOP);
    await expect(back).toBeEnabled();
    if(theme!=="winLP")await expect(back).toHaveCSS("background-color","rgb(106, 195, 47)");
    else await expect(back).toHaveCSS("background-image",/rgb\(122, 180, 254\)/);
    await back.click();
    await expect(forward).toBeEnabled();
    await forward.click();
    await expect(location).toHaveValue(SOURCE_DESKTOP);
    await win.getByRole("button",{name:"New folder",exact:true}).click();
    const dialog=win.getByRole("dialog",{name:"New folder"});
    await dialog.getByRole("textbox",{name:"New folder name"}).fill("Source Selection Folder");
    await dialog.getByRole("button",{name:"OK"}).click();
    const item=win.locator('[data-test-explorer-item="Source Selection Folder"]');
    await item.click();
    await expect(item).toHaveClass(/is-selected/);
    await expect(item).toHaveCSS("border-top-color",selectionBorder);
    if(theme==="winW")await expect(item).toHaveCSS("background-color","rgb(42, 106, 200)");
    else await expect(item).toHaveCSS("background-image",/linear-gradient/);
  });
}


for(const [theme,border,hover] of [
  ["winLP","rgb(65, 101, 159)","rgb(44, 104, 161)"],
  ["winLS","rgb(124, 124, 124)","rgb(201, 200, 203)"],
  ["winW","rgb(144, 144, 144)","rgb(56, 101, 154)"]
] as const){
  test(theme+" source Notepad menubar and actual status toggle",async({page})=>{
    await sourceThemeDesktop(page,theme);
    await page.locator("[data-test-start-button]").click();
    const start=page.locator("[data-test-start-menu]");
    await start.locator('[data-test-program="notepad"]').first().click();
    const win=page.locator('[data-test-window="notepad"]').first();
    await expect(win).toBeVisible();
    const bar=win.locator(".notepad-menu");
    if(theme==="winW")await expect(bar).toHaveCSS("background-color","rgb(235, 235, 228)");
    else await expect(bar).toHaveCSS("background-image",/linear-gradient/);
    const initial=await win.locator(".notepad-status").count();
    await bar.getByRole("button",{name:"View",exact:true}).click();
    const drop=bar.locator(".notepad-menu__dropdown");
    await expect(drop).toHaveCSS("border-top-color",border);
    const status=drop.getByRole("button",{name:/Status Bar/});
    await status.hover();
    await expect(status).toHaveCSS("border-top-color",hover);
    await status.click();
    await expect(win.locator(".notepad-status")).toHaveCount(initial===0?1:0);
    await expect(drop).toHaveCount(0);
  });
  test(theme+" source Explorer Organize menu paint and keyboard dismissal",async({page})=>{
    await sourceThemeDesktop(page,theme);
    await page.locator('[data-test-desktop-icon="computer"]').dblclick();
    const win=page.locator('[data-test-window="computer"]').first();
    const bar=win.locator(".explorer-command");
    if(theme==="winW")await expect(bar).toHaveCSS("background-color","rgb(235, 235, 228)");
    else await expect(bar).toHaveCSS("background-image",/linear-gradient/);
    const trigger=bar.locator("[data-test-explorer-organize] > button");
    await trigger.click();
    const drop=bar.locator(".explorer-organize__menu");
    await expect(drop).toHaveCSS("border-top-color",border);
    const option=drop.locator('button:not(:disabled)').first();
    await option.hover();
    await expect(option).toHaveCSS("border-top-color",hover);
    await page.keyboard.press("Escape");
    await expect(drop).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });
}

for(const theme of ["winLP","winLS","winW"] as const){
  test(theme+" flat All Programs flyout stays within viewport and launches an app",async({page})=>{
    await sourceThemeDesktop(page,theme);
    await page.locator("[data-test-start-button]").click();
    const start=page.locator("[data-test-start-menu]");
    const trigger=start.locator("[data-test-all-programs]");
    await trigger.click();
    const flyout=page.locator("[data-test-historical-programs-flyout]");
    await expect(flyout).toBeVisible();
    await expect(start).toBeVisible();
    const labels=await flyout.getByRole("menuitem").allTextContents();
    expect(labels.length).toBeGreaterThan(1);
    expect(labels).toEqual([...labels].sort((a,b)=>a.localeCompare(b)));
    const rect=await flyout.boundingBox();
    const viewport=page.viewportSize();
    expect(rect).not.toBeNull();
    expect(viewport).not.toBeNull();
    expect(rect!.x).toBeGreaterThanOrEqual(0);
    expect(rect!.y).toBeGreaterThanOrEqual(0);
    expect(rect!.x+rect!.width).toBeLessThanOrEqual(viewport!.width);
    expect(rect!.y+rect!.height).toBeLessThanOrEqual(viewport!.height);
    await page.keyboard.press("Escape");
    await expect(flyout).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await trigger.press("ArrowDown");
    await expect(flyout).toBeVisible();
    await flyout.locator('[data-test-source-program="notepad"]').click();
    await expect(page.locator('[data-test-window="notepad"]')).toBeVisible();
    await expect(flyout).toHaveCount(0);
  });
}


test("macOS original desktop selection and traffic-light window controls",async({page})=>{
  await sourceThemeDesktop(page,"macos");
  const icon=page.locator('[data-test-desktop-icon="computer"]');
  await icon.click();
  await expect(icon).toHaveClass(/is-active/);
  await expect(icon.locator(".desktop__icon-name")).toHaveCSS("background-color","rgb(4, 81, 208)");
  await expect(icon.locator(".desktop__icon-name")).toHaveCSS("font-weight","600");
  await expect(icon.locator(".desktop__icon-box")).toHaveCSS("background-color","rgba(0, 0, 0, 0.2)");
  await icon.dblclick();
  const win=page.locator('[data-test-window="computer"]').first();
  await expect(win).toBeVisible();
  await expect(win).toHaveCSS("border-top-left-radius","10px");
  await expect(win.locator(".windows-window__titlebar")).toHaveCSS("background-color","rgb(38, 38, 38)");
  await expect(win.locator(".windows-window__titlebar")).toHaveCSS("height","28px");
  const close=win.locator('[data-source-window-control="close"]');
  const min=win.locator('[data-source-window-control="minimize"]');
  const max=win.locator('[data-source-window-control="maximize"]');
  const circle=async(button:ReturnType<Page["locator"]>)=>button.evaluate(el=>getComputedStyle(el,"::before").backgroundColor);
  expect(await circle(close)).toBe("rgb(253, 88, 88)");
  expect(await circle(min)).toBe("rgb(253, 189, 48)");
  expect(await circle(max)).toBe("rgb(54, 204, 64)");
  const closeBounds=await close.boundingBox(),minBounds=await min.boundingBox(),maxBounds=await max.boundingBox();
  expect(closeBounds!.x).toBeLessThan(minBounds!.x);
  expect(minBounds!.x).toBeLessThan(maxBounds!.x);
  await max.click();
  await expect(win).toHaveClass(/is-maximized/);
  await expect(win).toHaveCSS("border-top-left-radius","0px");
  await win.locator('[data-source-window-control="restore"]').click();
  await expect(win).toHaveCSS("border-top-left-radius","10px");
  await close.click();
  await expect(win).toHaveCount(0);
});


test("macOS top menu bar and bottom dock preserve launch and maximize",async({page})=>{
  await sourceThemeDesktop(page,"macos");
  const bar=page.locator('[data-test-taskbar="base"]');
  const dock=page.locator("[data-test-macos-dock]");
  await expect(bar).toHaveCSS("height","28px");
  await expect(bar).toHaveCSS("background-color","rgb(32, 32, 32)");
  await expect(dock).toHaveCSS("background-color","rgb(15, 15, 15)");
  const bounds=await bar.boundingBox(),dockBounds=await dock.boundingBox(),viewport=page.viewportSize();
  expect(bounds!.y).toBe(0);
  expect(Math.abs(dockBounds!.y+dockBounds!.height-(viewport!.height-8))).toBeLessThan(2);
  await expect(dock.locator("[data-test-start-button] img")).toHaveCSS("width","48px");
  await dock.locator("[data-test-start-button]").click();
  await expect(page.locator("[data-test-start-menu]")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const win=page.locator('[data-test-window="computer"]').first();
  await expect(page.locator("[data-test-macos-active-title]")).toContainText("Computer");
  await win.locator('[data-source-window-control="maximize"]').click();
  const max=await win.boundingBox();
  expect(max!.y).toBe(28);
  expect(max!.y+max!.height).toBeLessThanOrEqual(dockBounds!.y+1);
});

test("macOS dock keeps fixed groups and recent/running apps without duplicates",async({page})=>{
  await sourceThemeDesktop(page,"macos");
  const dock=page.locator("[data-test-macos-dock]");
  const ids=async(group:number)=>dock.locator('[data-test-macos-dock-group="'+group+'"] [data-test-macos-dock-item]').evaluateAll(
    nodes=>nodes.map(node=>node.getAttribute("data-test-macos-dock-item")));
  expect(await ids(0)).toEqual(["computer","launchpad","cpanel"]);
  expect(await ids(2)).toEqual(["bin"]);
  await dock.locator('[data-test-macos-dock-item="computer"]').click();
  const win=page.locator('[data-test-window="computer"]').first();
  await expect(win).toBeVisible();
  await expect(dock.locator('[data-test-macos-dock-item="computer"]')).toHaveClass(/is-running/);
  await win.locator('[data-source-window-control="minimize"]').click();
  await dock.locator('[data-test-macos-dock-item="computer"]').click();
  await expect(win).toBeVisible();
  await win.locator('[data-source-window-control="close"]').click();
  await dock.locator('[data-test-macos-dock-item="bin"]').click();
  await expect(page.locator('[data-test-window="bin"]')).toBeVisible();
  expect(await ids(2)).toEqual(["bin"]);
});
