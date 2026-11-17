import {expect,test,type Page} from "@playwright/test";

async function guestTheme(page:Page,theme:"win7"|"winxp"|"win11"){
  await page.goto("/?theme="+theme);
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  const shell=page.locator('[data-test-main-screen]');
  await expect(shell).toHaveAttribute("data-theme",theme);
  return shell;
}
test("source WinXP blue shell tokens reach taskbar, window chrome and Start",async({page})=>{
  const shell=await guestTheme(page,"winxp");
  const taskbar=shell.locator(".windows-taskbar");
  await expect(taskbar).toHaveCSS("background-color","rgb(34, 87, 213)");
  await expect(taskbar).toHaveCSS("backdrop-filter","none");
  await shell.locator('[data-test-desktop-icon="computer"]').dblclick();
  const win=shell.locator('[data-test-window="computer"]');
  await expect(win).toHaveCSS("background-color","rgb(122, 150, 223)");
  await expect(win).toHaveCSS("border-top-color","rgb(0, 85, 230)");
  await page.getByRole("button",{name:"Open Start menu"}).click();
  const start=shell.locator('[data-test-start-menu]');
  await expect(start).toHaveClass(/windows-startmenu--winxp/);
  await expect(start).toHaveCSS("border-top-color","rgb(22, 101, 203)");
});
test("source Win11 has 48px pale centered taskbar, 40px app cells and light window",async({page})=>{
  const shell=await guestTheme(page,"win11");
  const taskbar=shell.locator(".windows-taskbar");
  await expect(taskbar).toHaveCSS("height","48px");
  await expect(taskbar).toHaveCSS("background-color","rgb(240, 240, 240)");
  await expect(taskbar).toHaveCSS("justify-content","center");
  await shell.locator('[data-test-desktop-icon="computer"]').dblclick();
  const win=shell.locator('[data-test-window="computer"]');
  await expect(win).toHaveCSS("background-color","rgb(240, 240, 240)");
  const app=taskbar.locator(".windows-taskbar__application").first();
  await expect(app).toHaveCSS("width","40px");
  await expect(app).toHaveCSS("height","40px");
  await page.getByRole("button",{name:"Open Start menu"}).click();
  const start=shell.locator('[data-test-start-menu]');
  await expect(start).toHaveClass(/windows-startmenu--win11/);
  const box=await start.boundingBox();
  expect(box).not.toBeNull();
  expect(Math.abs(box!.x+box!.width/2-(await page.evaluate(()=>innerWidth/2))))
    .toBeLessThanOrEqual(2);
});
test("new theme skin imports do not contaminate the original Win7 shell",async({page})=>{
  const shell=await guestTheme(page,"win7");
  await expect(shell.locator(".windows-taskbar")).toHaveCSS("height","40px");
  await expect(shell.locator(".windows-taskbar")).toHaveCSS("justify-content","normal");
  await page.getByRole("button",{name:"Open Start menu"}).click();
  const start=shell.locator('[data-test-start-menu]');
  await expect(start).not.toHaveClass(/windows-startmenu--winxp|windows-startmenu--win11/);
});

test("XP and Win11 shell consume the exact imported source Start/Computer/Bin artwork",async({page})=>{
  for(const theme of ["winxp","win11"] as const){
    const shell=await guestTheme(page,theme);
    const start=theme==="winxp"
      ? "/assets/images/start-button-winxp.a3485adf.webp"
      : "/assets/images/start-button-win11.e48a735f.webp";
    const computer=theme==="winxp"
      ? "/assets/images/computer-winxp.8cbae9da.webp"
      : "/assets/images/computer-win11.fc5b48e4.webp";
    const bin=theme==="winxp"
      ? "/assets/images/bin-winxp.7d0403fd.webp"
      : "/assets/images/bin-win11.73608517.webp";
    await expect(shell.locator("[data-test-start-button] img")).toHaveAttribute("src",start);
    await expect(shell.locator('[data-test-desktop-icon="computer"] .desktop__icon-icon'))
      .toHaveAttribute("src",computer);
    await expect(shell.locator('[data-test-desktop-icon="bin"] .desktop__icon-icon'))
      .toHaveAttribute("src",bin);
    for(const path of [start,computer,bin]){
      const response=await page.request.get(path);
      expect(response.ok(),theme+" source artwork "+path).toBe(true);
      expect((await response.body()).byteLength).toBeGreaterThan(0);
    }
  }
});
test("XP power controls and theme-specific Start folder use original imported art",async({page})=>{
  const xp=await guestTheme(page,"winxp");
  await page.getByRole("button",{name:"Open Start menu"}).click();
  let menu=xp.locator("[data-test-start-menu]");
  await expect(menu.locator('[data-test-startmenu-xp-footer] img')).toHaveCount(2);
  await expect(menu.locator('[data-test-startmenu-xp-footer] img').first())
    .toHaveAttribute("src","/assets/images/logoff-winxp.71dc5ab2.webp");
  await menu.locator("[data-test-all-programs]").click();
  await expect(menu.locator('[data-test-source-program-folder="Games"] img'))
    .toHaveAttribute("src","/assets/images/folder-winxp.ff1b00c5.webp");
  const win11=await guestTheme(page,"win11");
  await page.getByRole("button",{name:"Open Start menu"}).click();
  menu=win11.locator("[data-test-start-menu]");
  await menu.locator("[data-test-all-programs]").click();
  await expect(menu.locator('[data-test-source-program-folder="Games"] img'))
    .toHaveAttribute("src","/assets/images/folder-win11.49360b7d.webp");
});

test("source Computer and Bin Explorer show original XP/Win11 folder, file and navigation artwork",async({page})=>{
  for(const theme of ["winxp","win11"] as const){
    await guestTheme(page,theme);
    const names=theme==="winxp"?{
      computer:"computer-winxp.8cbae9da.webp",
      bin:"bin-winxp.7d0403fd.webp",
      folder:"folder-winxp.ff1b00c5.webp",
      file:"file-winxp.c130b357.webp"
    }:{
      computer:"computer-win11.fc5b48e4.webp",
      bin:"bin-win11.73608517.webp",
      folder:"folder-win11.49360b7d.webp",
      file:"file-win11.8b2c3723.webp"
    };
    const source=(key:keyof typeof names)=>"/assets/images/"+names[key];
    const folderName="Theme Folder "+theme;
    const fileName="Theme File "+theme+".bin";
    await page.locator('[data-test-desktop-icon="bin"]').dblclick();
    const bin=page.locator('[data-test-window="bin"]').last();
    await expect(bin).toBeVisible();
    await expect(bin.locator(".explorer-navigation__home img").first())
      .toHaveAttribute("src",source("bin"));
    await bin.getByRole("button",{name:/^Close /}).click();
    await page.locator('[data-test-desktop-icon="computer"]').dblclick();
    const computer=page.locator('[data-test-window="computer"]').last();
    await expect(computer).toBeVisible();
    await expect(computer.locator(".explorer-navigation__home img").first())
      .toHaveAttribute("src",source("computer"));
    await expect(computer.locator(".explorer-navigation__home").filter({hasText:"Desktop"}).locator("img"))
      .toHaveAttribute("src",source("folder"));
    await computer.getByRole("button",{name:"New folder"}).click();
    const dialog=computer.getByRole("dialog",{name:"New folder"});
    await dialog.getByRole("textbox",{name:"New folder name"}).fill(folderName);
    await dialog.getByRole("button",{name:"OK"}).click();
    await expect(computer.locator('[data-test-explorer-item="'+folderName+'"] .listview__item-iconbox img'))
      .toHaveAttribute("src",source("folder"));
    await computer.locator('input[aria-label="Upload files"]').setInputFiles({
      name:fileName,mimeType:"application/octet-stream",buffer:Buffer.from([1,2,3])
    });
    await expect(computer.locator('[data-test-explorer-item="'+fileName+'"] .listview__item-iconbox img'))
      .toHaveAttribute("src",source("file"));
  }
});

test("XP and Win11 Start and taskbar use byte-verified original program artwork",async({page})=>{
  for(const theme of ["winxp","win11"] as const){
    await guestTheme(page,theme);
    const expected=theme==="winxp"
      ?"/assets/images/notepad-winxp.82037fb1.webp"
      :"/assets/images/notepad-win11.2e4af294.webp";
    await page.getByRole("button",{name:"Open Start menu"}).click();
    const start=page.locator("[data-test-start-menu]");
    await expect(start.locator('[data-test-program="notepad"] img'))
      .toHaveAttribute("src",expected);
    await start.locator('[data-test-program="notepad"]').click();
    await expect(page.locator('[data-test-window="notepad"]')).toBeVisible();
    await expect(page.locator(".windows-taskbar__application img").first())
      .toHaveAttribute("src",expected);
  }
});

test("XP and Win11 Desktop file icons use original theme artwork like Explorer",async({page})=>{
  for(const theme of ["winxp","win11"] as const){
    await guestTheme(page,theme);
    const name="Source Theme "+theme+".bin";
    await page.locator("[data-test-desktop-upload-input]").setInputFiles({
      name,mimeType:"application/octet-stream",buffer:Buffer.from([1,2,3])
    });
    const entry=page.locator('[data-test-desktop-file="/EXTERNAL/computer/drive0/Users/Guest/Desktop/'+name+'"]');
    await expect(entry).toBeVisible();
    await expect(entry.locator("img.desktop__icon-icon")).toHaveAttribute(
      "src",theme==="winxp"
        ?"/assets/images/file-winxp.c130b357.webp"
        :"/assets/images/file-win11.8b2c3723.webp");
    await expect(entry).toHaveAttribute("data-source-desktop-artwork","original");
  }
});

test("XP and Win11 Computer sidebar shows pinned source drive and Guest folder art",async({page})=>{
  for(const theme of ["winxp","win11"] as const){
    await guestTheme(page,theme);
    await page.locator('[data-test-desktop-icon="computer"]').dblclick();
    const computer=page.locator('[data-test-window="computer"]');
    const nav=computer.locator(".explorer-navigation__home");
    const icons=theme==="winxp"?{
      system:"disk-os-winxp.e3c2a016.webp",
      dvd:"disk-cd-winxp.83ac2166.webp",
      docs:"folder-docs-winxp.a303ce2a.webp"
    }:{
      system:"disk-os-win11.4aee0d0a.webp",
      dvd:"disk-cd-win11.84d9e496.webp",
      docs:"folder-docs-win11.18b5729b.webp"
    };
    await expect(nav.filter({hasText:"System (C:)"}).locator("img"))
      .toHaveAttribute("src","/assets/images/"+icons.system);
    await expect(nav.filter({hasText:"Documents"}).locator("img"))
      .toHaveAttribute("src","/assets/images/"+icons.docs);
    await expect(nav.filter({hasText:"DVD RW Drive (Z:)"}).locator("img"))
      .toHaveAttribute("src","/assets/images/"+icons.dvd);
    await expect(nav.filter({hasText:"DVD RW Drive (Z:)"})).toBeDisabled();
  }
});
