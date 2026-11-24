import {expect,test,type Page} from "@playwright/test";

const SOURCE_DESKTOP="/EXTERNAL/computer/drive0/Users/Guest/Desktop";
const artwork={
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

for(const theme of ["win95","win98","win2k","winxp","win10","win11","macos","chromeos","ubuntu","kubuntu"] as const){
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
    if(theme==="chromeos"){
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
