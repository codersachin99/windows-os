import {expect,test,type Page} from "@playwright/test";
async function openPersonalize(page:Page){
  await page.goto("/");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  const desktop=page.locator("#desktop-icons");
  await desktop.click({button:"right",position:{x:260,y:200}});
  const menu=desktop.locator("[data-test-desktop-menu]");
  await expect(menu).toBeVisible();
  await menu.locator("[data-test-desktop-personalize]").click();
  const win=page.locator('[data-test-window="personalize"]');
  await expect(win).toBeVisible();
  return win;
}
test("source Desktop Personalize changes shell, artwork and wallpaper in place",async({page})=>{
  const win=await openPersonalize(page);
  const chooser=win.locator("[data-test-personalize]");
  await expect(chooser.locator("[data-test-personalize-group]")).toHaveCount(2);
  const xp=chooser.locator('[data-test-personalize-theme="winxp"]');
  const eleven=chooser.locator('[data-test-personalize-theme="win11"]');
  await expect(xp.locator("img")).toHaveAttribute("src",
    "/assets/images/winxp.3e41719f.webp");
  await expect(eleven.locator("img")).toHaveAttribute("src",
    "/assets/images/win11.fc00c43d.webp");
  await xp.click();
  await expect(page.locator("[data-test-main-screen]")).toHaveAttribute("data-theme","winxp");
  await expect(xp).toHaveAttribute("aria-pressed","true");
  await expect(page.locator("[data-test-desktop-background]"))
    .toHaveCSS("background-image",/winxp\.3e41719f\.webp/);
  await eleven.click();
  await expect(page.locator("[data-test-main-screen]")).toHaveAttribute("data-theme","win11");
  await expect(eleven).toHaveAttribute("aria-pressed","true");
  await expect(page.locator("[data-test-start-button] img"))
    .toHaveAttribute("src","/assets/images/start-button-win11.e48a735f.webp");
  await expect(page.locator("[data-test-desktop-background]"))
    .toHaveCSS("background-image",/win11\.fc00c43d\.webp/);
});
test("source selected theme restores on login and explicit theme URL overrides it",async({page})=>{
  const win=await openPersonalize(page);
  await win.locator('[data-test-personalize-theme="winxp"]').click();
  await page.reload();
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await expect(page.locator("[data-test-main-screen]")).toHaveAttribute("data-theme","winxp");
  await page.goto("/?theme=win7");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await expect(page.locator("[data-test-main-screen]")).toHaveAttribute("data-theme","win7");
});


test("source Personalize chooses Win8 and Win8.1 separately with original wallpaper",async({page})=>{
  const win=await openPersonalize(page);
  const chooser=win.locator('[data-test-personalize]');
  const eight=chooser.locator('[data-test-personalize-theme="win8"]');
  const eightOne=chooser.locator('[data-test-personalize-theme="win81"]');
  await expect(eight.locator("img")).toHaveAttribute(
    "src","/assets/images/win8.3a5f11f3.webp");
  await expect(eightOne.locator("img")).toHaveAttribute(
    "src","/assets/images/win81.7b80787e.webp");
  await eight.click();
  await expect(page.locator('[data-test-main-screen]'))
    .toHaveAttribute("data-theme","win8");
  await expect(page.locator('[data-test-desktop-background]'))
    .toHaveAttribute("data-test-desktop-background",
      "/assets/images/win8.3a5f11f3.webp");
  await expect(eight).toHaveAttribute("aria-pressed","true");
  await eightOne.click();
  await expect(page.locator('[data-test-main-screen]'))
    .toHaveAttribute("data-theme","win81");
  await expect(page.locator('[data-test-desktop-background]'))
    .toHaveAttribute("data-test-desktop-background",
      "/assets/images/win81.7b80787e.webp");
  await expect(eightOne).toHaveAttribute("aria-pressed","true");
  await expect(page.locator('[data-test-start-button] img'))
    .toHaveAttribute("src","/assets/images/start-button-win8.2e5214cc.svg");
  await page.reload();
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await expect(page.locator('[data-test-main-screen]'))
    .toHaveAttribute("data-theme","win81");
  await expect(page.locator('[data-test-desktop-background]'))
    .toHaveAttribute("data-test-desktop-background",
      "/assets/images/win81.7b80787e.webp");
  await page.getByRole("button",{name:"Open Start menu"}).click();
  await expect(page.locator('[data-test-win8-start-screen]'))
    .toHaveAttribute("data-source-start-theme","win81");
});


test("Personalize exposes source Windows 10 with persistent wallpaper, Start and taskbar",async({page})=>{
  const win=await openPersonalize(page);
  const chooser=win.locator('[data-test-personalize]');
  const ten=chooser.locator('[data-test-personalize-theme="win10"]');
  await expect(ten).toBeVisible();
  await expect(ten.locator("img")).toHaveAttribute(
    "src","/assets/images/win10.743e8c13.webp");
  await ten.click();
  const desktop=page.locator('[data-test-main-screen]');
  await expect(desktop).toHaveAttribute("data-theme","win10");
  await expect(ten).toHaveAttribute("aria-pressed","true");
  await expect(page.locator('[data-test-desktop-background]'))
    .toHaveAttribute("data-test-desktop-background",
      "/assets/images/win10.743e8c13.webp");
  await expect(page.locator('[data-test-start-button] img'))
    .toHaveAttribute("src","/assets/images/start-button-win8.2e5214cc.svg");
  await expect(page.locator('[data-test-taskbar="base"]'))
    .toHaveCSS("background-color","rgb(16, 16, 16)");
  await page.getByRole("button",{name:"Open Start menu"}).click();
  await expect(page.locator('.windows-startmenu--win10')).toBeVisible();
  await page.reload();
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await expect(page.locator('[data-test-main-screen]')).toHaveAttribute("data-theme","win10");
  await expect(page.locator('[data-test-desktop-background]'))
    .toHaveAttribute("data-test-desktop-background",
      "/assets/images/win10.743e8c13.webp");
});


test("Personalize switches original Win95, Win98 and Win2k while keeping 3 classic palettes",async({page})=>{
  const win=await openPersonalize(page);
  const chooser=win.locator('[data-test-personalize]');
  for(const classic of [
    {id:"win95",wallpaper:"/assets/images/win95.fcef1b3b.webp",
      bg:"rgb(189, 190, 189)"},
    {id:"win98",wallpaper:"/assets/images/win95.fcef1b3b.webp",
      bg:"rgb(192, 199, 200)"},
    {id:"win2k",wallpaper:"/assets/images/default-win2k.1c1f7fa2.png",
      bg:"rgb(212, 208, 200)"}
  ]){
    const tile=chooser.locator('[data-test-personalize-theme="'+classic.id+'"]');
    await expect(tile).toBeVisible();
    await expect(tile.locator("img")).toHaveAttribute("src",classic.wallpaper);
    await tile.click();
    await expect(tile).toHaveAttribute("aria-pressed","true");
    const desktop=page.locator('[data-test-main-screen]');
    await expect(desktop).toHaveAttribute("data-theme",classic.id);
    await expect(desktop.locator('[data-test-desktop-background]'))
      .toHaveAttribute("data-test-desktop-background",classic.wallpaper);
    await expect(desktop.locator('[data-test-taskbar="base"]'))
      .toHaveCSS("background-color",classic.bg);
  }
  await page.getByRole("button",{name:"Open Start menu"}).click();
  await expect(page.locator('[data-test-win9x-start-menu]'))
    .toHaveAttribute("data-source-start-theme","win2k");
  await page.reload();
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await expect(page.locator('[data-test-main-screen]')).toHaveAttribute("data-theme","win2k");
  await expect(page.locator('[data-test-desktop-background]'))
    .toHaveAttribute("data-test-desktop-background",
      "/assets/images/default-win2k.1c1f7fa2.png");
});

test("Win11 Dark chooses exact pinned source wallpaper/Start and native dark shell",async({page})=>{
  const win=await openPersonalize(page);
  const dark=win.locator('[data-test-personalize-theme="win11dark"]');
  await expect(dark).toBeVisible();
  await expect(dark.locator("img")).toHaveAttribute(
    "src","/assets/images/win11dark.af52a1ca.webp");
  await dark.click();
  const desktop=page.locator("[data-test-main-screen]");
  await expect(desktop).toHaveAttribute("data-theme","win11dark");
  await expect(dark).toHaveAttribute("aria-pressed","true");
  await expect(page.locator("[data-test-desktop-background]"))
    .toHaveAttribute("data-test-desktop-background",
      "/assets/images/win11dark.af52a1ca.webp");
  await expect(page.locator("[data-test-start-button] img"))
    .toHaveAttribute("src","/assets/images/start-button-win11dark.d417814c.webp");
  const taskbar=page.locator('[data-test-taskbar="base"]');
  await expect(taskbar).toHaveCSS("height","48px");
  await expect(taskbar).toHaveCSS("background-color","rgb(28, 28, 28)");
  await page.locator("[data-test-start-button]").click();
  const menu=page.locator(".windows-startmenu--win11");
  await expect(menu).toBeVisible();
  await expect(menu).toHaveCSS("background-color","rgb(36, 36, 36)");
  await expect(menu).toHaveCSS("color","rgb(255, 255, 255)");
  await menu.locator('[data-test-program="notepad"]').click();
  const notepad=page.locator('[data-test-window="notepad"]');
  await expect(notepad).toBeVisible();
  await expect(notepad).toHaveCSS("background-color","rgb(28, 28, 28)");
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const computer=page.locator('[data-test-window="computer"]').first();
  await expect(computer).toBeVisible();
  await expect(computer).toHaveCSS("background-color","rgb(28, 28, 28)");
  // Windows correctly intercept desktop pointers while open. Minimize all
  // three overlapping windows before exercising the actual desktop context.
  for(const openWindow of [computer,notepad,win]){
    await openWindow.locator('[data-source-window-control="minimize"]').click();
    await expect(openWindow).toBeHidden();
  }
  // The same original Win11 context structure uses distinct dark tokens.
  await page.locator("#desktop-icons").click({
    button:"right",position:{x:270,y:210}
  });
  await expect(page.locator('[data-test-desktop-menu]'))
    .toHaveCSS("background-color","rgb(36, 36, 36)");
  await page.reload();
  const logon=page.locator('[data-test-logon-screen]');
  await expect(logon).toHaveAttribute("data-source-logon-renderer","win11");
  await expect(logon).toHaveAttribute("data-source-shell-status","partial");
  await expect(logon).toHaveCSS("background-image",/win11dark\.af52a1ca\.webp/);
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await expect(page.locator("[data-test-main-screen]"))
    .toHaveAttribute("data-theme","win11dark");
  await expect(page.locator("[data-test-desktop-background]"))
    .toHaveAttribute("data-test-desktop-background",
      "/assets/images/win11dark.af52a1ca.webp");
});
