import {expect,test,type Page} from "@playwright/test";
const xpWallpaper=(theme:string)=>({
  winxpG:"/assets/images/autumn.41774694.webp",
  winxpR:"/assets/images/follows.3e030a12.webp",
  winxpS:"/assets/images/azul.3af33f73.webp",
  winxpZ:"/assets/images/ascent.7c62e722.webp"
} as Record<string,string>)[theme]??"/assets/images/winxp.3e41719f.webp";

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
  await expect(chooser.locator("[data-test-personalize-group]")).toHaveCount(3);
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
    {id:"win95",wallpaper:"#007d7b",
      bg:"rgb(189, 190, 189)"},
    {id:"win98",wallpaper:"#57a8a8",
      bg:"rgb(192, 199, 200)"},
    {id:"win2k",wallpaper:"#3b6ea4",
      bg:"rgb(212, 208, 200)"}
  ]){
    const tile=chooser.locator('[data-test-personalize-theme="'+classic.id+'"]');
    await expect(tile).toBeVisible();
    await expect(tile.locator("img")).toHaveCount(0);
    await expect(tile.locator(".windows-personalize__theme-solid")).toBeVisible();
    expect(await tile.locator(".windows-personalize__theme-solid").evaluate(el=>(el as HTMLElement).style.backgroundColor)).toBe(
      {"win95":"rgb(0, 125, 123)","win98":"rgb(87, 168, 168)","win2k":"rgb(59, 110, 164)"}[classic.id]);

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
      "#3b6ea4");
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

/** Original personalize.css swatches, not inferred from the wallpaper:
 * XP variants use their exact original background and their own 25px
 * source palette marker. Check desktop and mobile Playwright projects. */
test("Personalize offers all seven original XP palettes with persistent selection",async({page})=>{
  const win=await openPersonalize(page);
  const cases=[
    ["winxp","rgb(0, 85, 230)","rgb(0, 85, 230)"],
    ["winxpE","rgb(1, 47, 84)","rgb(52, 123, 179)"],
    ["winxpG","rgb(186, 200, 145)","rgb(186, 200, 145)"],
    ["winxpN","rgb(22, 29, 45)","rgb(102, 115, 124)"],
    ["winxpR","rgb(42, 77, 171)","rgb(153, 198, 241)"],
    ["winxpS","rgb(224, 223, 227)","rgb(224, 223, 227)"],
    ["winxpZ","rgb(37, 37, 37)","rgb(111, 111, 111)"]
  ] as const;
  for(const [theme,border,paint] of cases){
    const item=win.locator('[data-test-personalize-theme="'+theme+'"]');
    await expect(item).toBeVisible();
    await expect(item.locator("img")).toHaveAttribute("src",xpWallpaper(theme));
    const swatch=item.locator('[data-test-personalize-color="'+theme+'"]');
    await expect(swatch).toHaveCSS("border-top-color",border);
    const renderedPaint=await swatch.evaluate(element=>{
      const css=getComputedStyle(element);
      return css.backgroundImage+" "+css.backgroundColor;
    });
    expect(renderedPaint,theme+" original source swatch").toContain(paint);
    await item.click();
    await expect(page.locator('[data-test-main-screen]'))
      .toHaveAttribute("data-theme",theme);
    await expect(item).toHaveAttribute("aria-pressed","true");
    await expect(page.locator('[data-test-desktop-background]'))
      .toHaveAttribute("data-test-desktop-background",xpWallpaper(theme));
  }
  await page.reload();
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await expect(page.locator('[data-test-main-screen]'))
    .toHaveAttribute("data-theme","winxpZ");
});


/* Pinned theme registry 3b8c, palette 2299 and source personalize.js.
 * The original category has four Aero tiles, not canonical win7+four.
 * Source Basic2–4 backgrounds are solid CSS colors, not Win7 wallpaper. */
test("Aero and Basic original thumbnails, palettes, desktop backgrounds and persistence",async({page})=>{
  const win=await openPersonalize(page);
  const chooser=win.locator('[data-test-personalize]');
  await expect(chooser.locator('[data-test-personalize-group="aero"] [data-test-personalize-theme]'))
    .toHaveCount(4);
  await expect(chooser.locator('[data-test-personalize-group="basic"] [data-test-personalize-theme]'))
    .toHaveCount(4);
  const variants=[
    {id:"aero-1",name:"Windows 7",asset:"/assets/images/default.deccec52.webp",
      paint:"linear-gradient",accent:"#aad1fb"},
    {id:"aero-2",name:"Architecture",asset:"/assets/images/architecture.e651db26.webp",
      paint:"linear-gradient",accent:"#5986ca"},
    {id:"aero-3",name:"Landscape",asset:"/assets/images/landscape.1626b82c.webp",
      paint:"linear-gradient",accent:"#ababab"},
    {id:"aero-4",name:"Nature",asset:"/assets/images/nature.e05e4ec0.webp",
      paint:"linear-gradient",accent:"#9f81bf"},
    {id:"basic-1",name:"Windows 7 Basic",asset:"/assets/images/default.deccec52.webp",
      paint:"rgb(167, 192, 220)",accent:"#a7c0dc"},
    {id:"basic-2",name:"Windows Classic",asset:"#3b6ea4",
      paint:"rgb(212, 208, 200)",accent:null},
    {id:"basic-3",name:"High Contrast Black",asset:"#000",
      paint:"rgb(255, 255, 255)",accent:null},
    {id:"basic-4",name:"High Contrast White",asset:"#fff",
      paint:"rgb(255, 255, 255)",accent:null}
  ] as const;
  for(const {id,name,asset,paint,accent} of variants){
    const tile=chooser.locator('[data-test-personalize-theme="'+id+'"]');
    await expect(tile).toBeVisible();
    await expect(tile).toContainText(name);
    if(asset.startsWith("#")){
      await expect(tile.locator("img")).toHaveCount(0);
      await expect(tile.locator(".windows-personalize__theme-solid"))
        .toHaveCSS("background-color",
          asset==="#3b6ea4"?"rgb(59, 110, 164)":
            asset==="#000"?"rgb(0, 0, 0)":"rgb(255, 255, 255)");
    }else{
      await expect(tile.locator("img")).toHaveAttribute("src",asset);
    }
    const swatch=tile.locator('[data-test-personalize-color="'+id+'"]');
    await expect(swatch).toHaveCSS("height","25px");
    const sample=await swatch.evaluate(el=>{
      const css=getComputedStyle(el);
      return {background:css.backgroundColor+" "+css.backgroundImage,
        color:css.getPropertyValue("--preview-color").trim(),
        before:getComputedStyle(el,"::before").content,
        after:getComputedStyle(el,"::after").content};
    });
    expect(sample.background,id).toContain(paint);
    if(accent)expect(sample.color,id).toBe(accent);
    if(id.startsWith("basic-"))
      expect([sample.before,sample.after]).toEqual(['""','""']);
    await tile.click();
    await expect(chooser).toHaveAttribute("data-active-theme",id);
    await expect(page.locator('[data-test-main-screen]')).toHaveAttribute("data-theme",id);
    await expect(tile).toHaveAttribute("aria-pressed","true");
    const desktopBg=page.locator('[data-test-desktop-background]');
    await expect(desktopBg).toHaveAttribute("data-test-desktop-background",asset);
    if(asset.startsWith("#")){
      await expect(desktopBg).toHaveCSS("background-image","none");
    }else{
      expect(await desktopBg.evaluate(el=>getComputedStyle(el).backgroundImage))
        .toContain(asset);
    }
  }
  await page.reload();
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await expect(page.locator('[data-test-main-screen]'))
    .toHaveAttribute("data-theme","basic-4");
  await expect(page.locator('[data-test-desktop-background]'))
    .toHaveCSS("background-color","rgb(255, 255, 255)");
});

test("source Aero per-variant colors use original palette and alpha on real shell",async({page})=>{
  for(const {id,active,inactive,background} of [
    {id:"aero-1",active:"rgba(170, 209, 251, 0.65)",
      inactive:"rgba(170, 209, 251, 0.3)",
      background:"/assets/images/default.deccec52.webp"},
    {id:"aero-2",active:"rgba(89, 134, 202, 0.65)",
      inactive:"rgba(89, 134, 202, 0.3)",
      background:"/assets/images/architecture.e651db26.webp"},
    {id:"aero-3",active:"rgba(171, 171, 171, 0.65)",
      inactive:"rgba(171, 171, 171, 0.3)",
      background:"/assets/images/landscape.1626b82c.webp"},
    {id:"aero-4",active:"rgba(159, 129, 191, 0.65)",
      inactive:"rgba(159, 129, 191, 0.3)",
      background:"/assets/images/nature.e05e4ec0.webp"}
  ] as const){
    await page.goto("/?theme="+id);
    await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
    const root=page.locator('[data-test-main-screen]');
    const actual=await root.evaluate(el=>({
      active:getComputedStyle(el).getPropertyValue("--theme-color").trim(),
      inactive:getComputedStyle(el).getPropertyValue("--theme-color--inactive").trim()
    }));
    expect(actual,id).toEqual({active,inactive});
    await expect(page.locator('[data-test-desktop-background]'))
      .toHaveAttribute("data-test-desktop-background",background);
    await page.locator('[data-test-desktop-icon="computer"]').dblclick();
    const frame=page.locator('[data-test-window="computer"]');
    await expect(frame).toHaveCSS("background-image",/linear-gradient/);
    await frame.getByRole("button",{name:"Close Computer"}).click();
  }
});
