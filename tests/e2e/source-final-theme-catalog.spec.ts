import {expect,test} from "@playwright/test";

/**
 * Final source app.config.json contains 36 named themeScreens entries,
 * including shared screen families. Full source-exact visuals are NOT
 * implied by recognizing a source theme ID or showing a Win7 fallback.
 */
test("source theme variants select exact login screen families and report fallback",async({page})=>{
  const cases=[
    ["aero-3","win7","win7","partial"],
    ["winxpE","winxp","winxp","partial"],
    ["win31","win31","win31","partial"],
    ["win95","win95","win95","partial"],
    ["win98","win98","win98","partial"],
    ["win2k","win2k","win2k","partial"],
    ["winvista","winvista","win7-fallback","partial"],
    ["win10","win10","win10","partial"],
    ["win8","win8","win8","partial"],
    ["win81","win8","win8","partial"],
    ["win11dark","win11","win11","partial"],
    ["winLS","winLS","winLS","pending"],
    ["winLP","winLS","winLS","pending"],
    ["aeroNoir","aeroNoir","aeroNoir","pending"],
    ["kubuntu","kubuntu","win7-fallback","pending"],
    ["winW","winW","winW","pending"],
    ["onebit","onebit","onebit","pending"]
  ] as const;
  for(const [id,screen,renderer,status] of cases){
    await page.goto("/?theme="+id);
    const login=page.locator('[data-test-logon-screen]');
    await expect(login).toBeVisible({timeout:12000});
    await expect(login).toHaveAttribute("data-source-theme-id",id);
    await expect(login).toHaveAttribute("data-source-logon-theme",screen);
    await expect(login).toHaveAttribute("data-source-logon-renderer",renderer);
    await expect(login).toHaveAttribute("data-source-shell-status",status);
    await expect(page.locator('[data-test-main-screen]')).toHaveCount(0);
  }
});

test("canonical Win7 source screen remains original art; unknown IDs are rejected",async({page})=>{
  await page.goto("/?theme=win7");
  const login=page.locator('[data-test-logon-screen]');
  await expect(login).toHaveAttribute("data-source-logon-theme","win7");
  await expect(login).toHaveAttribute("data-source-logon-renderer","win7");
  await expect(login).toHaveAttribute("data-source-shell-status","partial");
  await expect(login).toHaveCSS("background-image",/login\.85fd59c8\.webp/);
  await page.goto("/?theme=__proto__");
  await expect(page.locator('[data-test-logon-screen]'))
    .toHaveAttribute("data-source-theme-id","win7");
});

test("source theme catalog selection carries through explicit Guest login",async({page})=>{
  await page.goto("/?theme=win11dark");
  await expect(page.locator('[data-test-logon-screen]'))
    .toHaveAttribute("data-source-logon-theme","win11");
  await page.locator('[data-test-avatar="win7"]').click();
  const desktop=page.locator('[data-test-main-screen]');
  await expect(desktop).toBeVisible();
  await expect(desktop).toHaveAttribute("data-theme","win11dark");
  // Win11dark now has original wallpaper/Start artwork and source palette,
  // but whole-theme pixel parity and remaining original actions are pending.
  await expect(page.locator('[data-test-taskbar="base"]')).toBeVisible();
});


test("original XP logon renders three bands, exact source logo and responsive Guest account",async({page})=>{
  await page.goto("/?theme=winxpG");
  const login=page.locator("[data-test-logon-screen]");
  await expect(login).toHaveAttribute("data-source-logon-renderer","winxp");
  await expect(login.locator(".source-xp-logon__top")).toBeVisible();
  await expect(login.locator(".source-xp-logon__body")).toBeVisible();
  await expect(login.locator(".source-xp-logon__bottom")).toBeVisible();
  await expect(login.locator('[data-test-source-logon-logo="winxp"]'))
    .toHaveAttribute("src","/assets/images/logoxp.9b034658.png");
  await expect(login.locator(".source-xp-logon__body"))
    .toHaveCSS("background-image",/radial-gradient/);
  const avatar=login.locator('[data-test-source-logon-avatar="winxp"]');
  await expect(avatar).toBeVisible();
  await expect(avatar).toContainText("Guest");
  await expect(login.locator("[data-test-avatar=win7]")).toHaveCount(1);
  await avatar.click();
  await expect(page.locator("[data-test-main-screen]")).toBeVisible();
  await expect(page.locator("[data-test-main-screen]"))
    .toHaveAttribute("data-theme","winxpG");
});

// First stops in the original XP-specific painted frame gradients. These
// complement token-only checks, which could pass while rendering Luna blue.
const paintedXpFrames={
  winxpN:{taskbar:"rgb(115, 124, 132)",tray:"rgb(37, 54, 73)",
    header:"rgb(97, 108, 125)",footer:"rgb(115, 124, 137)",
    window:"rgb(103, 115, 124)"},
  winxpR:{taskbar:"rgb(131, 194, 237)",tray:"rgb(251, 253, 255)",
    header:"rgb(242, 247, 251)",footer:"rgb(118, 161, 222)",
    window:"rgb(131, 194, 237)"},
  winxpS:{taskbar:"rgb(154, 153, 177)",tray:"rgb(255, 255, 255)",
    header:"rgb(168, 167, 191)",footer:"rgb(230, 230, 237)",
    window:"rgb(168, 167, 191)"},
  winxpZ:{taskbar:"rgb(111, 111, 111)",tray:"rgb(72, 72, 72)",
    header:"rgb(87, 87, 87)",footer:"rgb(87, 87, 87)",
    window:"rgb(111, 111, 111)"}
} as const;

// Original theme-winxp-scss.js defines distinct color tokens for each XP
// variant. Every ID must use real XP artwork and XP Start/Power UI rather than
// silently falling back to a Win7 shell, on both desktop and mobile profiles.
for(const [theme,border,right,accent] of [
  ["winxp","#1665cb","#d3e5fa","#316ac5"],
  ["winxpE","#010305","#3c83bb","#3e9de8"],
  ["winxpG","#bdbfa8","#f1f2e4","#93a070"],
  ["winxpN","#01060e","#5a606f","#5e81bc"],
  ["winxpR","#6595cd","#5373bf","#335ea8"],
  ["winxpS","#6b6e73","#e7e6ed","#bbb7c7"],
  ["winxpZ","#080808","#666","#bebebe"]
] as const){
  test("original XP "+theme+" retains XP shell with source-defined variant palette",async({page})=>{
    await page.goto("/?theme="+theme);
    const login=page.locator('[data-test-logon-screen]');
    await expect(login).toHaveAttribute("data-source-logon-renderer","winxp");
    await expect(login).toHaveAttribute("data-source-shell-status","partial");
    await login.locator('[data-test-source-logon-avatar="winxp"]').click();
    const desktop=page.locator('[data-test-main-screen]');
    await expect(desktop).toHaveAttribute("data-theme",theme);
    await expect(desktop).toHaveCSS("--source-startmenu-border",border);
    await expect(desktop).toHaveCSS("--source-startmenu-right",right);
    await expect(desktop).toHaveCSS("--source-accent",accent);
    await expect(page.locator('[data-test-desktop-background]'))
      .toHaveAttribute("data-test-desktop-background",
        "/assets/images/winxp.3e41719f.webp");
    await expect(page.locator('[data-test-start-button] img'))
      .toHaveAttribute("src","/assets/images/start-button-winxp.a3485adf.webp");
    await page.locator('[data-test-start-button]').click();
    const start=page.locator('[data-test-start-menu]');
    await expect(start).toHaveClass(/windows-startmenu--winxp/);
    await expect(start.locator('[data-test-startmenu-xp-header]')).toBeVisible();
    await expect(start.locator('[data-test-startmenu-xp-footer]')).toBeVisible();
    await expect(start.locator('[data-test-startmenu-xp-footer] img').first())
      .toHaveAttribute("src","/assets/images/logoff-winxp.71dc5ab2.webp");
    if(theme==="winxpG")
      await expect(page.locator(".windows-taskbar__tray"))
        .toHaveCSS("border-left-color","rgb(150, 139, 75)");
    if(theme in paintedXpFrames){
      const paint=paintedXpFrames[theme as keyof typeof paintedXpFrames];
      for(const [selector,firstStop] of [
        ['[data-test-taskbar="base"]',paint.taskbar],
        [".windows-taskbar__tray",paint.tray],
        ["[data-test-startmenu-xp-header]",paint.header],
        ["[data-test-startmenu-xp-footer]",paint.footer]
      ] as const){
        const background=await page.locator(selector).evaluate(
          element=>getComputedStyle(element).backgroundImage);
        expect(background,`${theme} source paint for ${selector}`).toContain(firstStop);
      }
      await page.locator('[data-test-start-button]').click();
      await page.locator('[data-test-desktop-icon="computer"]').dblclick();
      const win=page.locator('[data-test-window="computer"]');
      await expect(win).toBeVisible();
      await expect(win).toHaveAttribute("data-source-window-active","true");
      const frame=await win.evaluate(element=>getComputedStyle(element).backgroundImage);
      expect(frame,`${theme} active caption frame`).toContain(paint.window);
    }
  });
}

test("original Win11 logon uses source guest-win10 art, dark overlay and Guest sign-in",async({page})=>{
  await page.goto("/?theme=win11dark");
  const login=page.locator("[data-test-logon-screen]");
  await expect(login).toHaveAttribute("data-source-logon-renderer","win11");
  await expect(login).toHaveCSS("background-image",/win11dark\.af52a1ca\.webp/);
  const avatar=login.locator('[data-test-source-logon-avatar="win11"]');
  await expect(avatar.locator("img"))
    .toHaveAttribute("src","/assets/images/guest-win10.a110df5a.webp");
  await expect(avatar).toHaveCSS("border-radius","50%");
  await expect(login.locator(".source-win11-logon__overlay"))
    .toHaveCSS("background-color","rgba(0, 0, 0, 0.5)");
  await login.getByRole("button",{name:"Sign in"}).click();
  await expect(page.locator("[data-test-main-screen]")).toBeVisible();
  await expect(page.locator("[data-test-main-screen]"))
    .toHaveAttribute("data-theme","win11dark");
});

test("XP and Win11 login retain power controls and never fake account authentication",async({page})=>{
  for(const theme of ["winxp","win11"] as const){
    await page.goto("/?theme="+theme);
    const login=page.locator("[data-test-logon-screen]");
    const account=login.getByRole("button",{
      name:theme==="winxp"?"Create a new account":"Other user"
    });
    await account.click();
    await expect(login.getByRole("dialog",{name:"Account login"})).toBeVisible();
    await login.getByRole("button",{name:"Back"}).click();
    await expect(login.getByRole("dialog",{name:"Account login"})).toHaveCount(0);
    await login.getByRole("button",{name:"Power options"}).click();
    await expect(login.locator('[data-test-logon-restart]')).toBeVisible();
    await expect(login.locator('[data-test-logon-shutdown]')).toBeVisible();
    await expect(page.locator("[data-test-main-screen]")).toHaveCount(0);
  }
});

test("Windows 10 logon uses pinned original Win10 wallpaper and shared guest-win10 avatar",async({page})=>{
  await page.goto("/?theme=win10");
  const login=page.locator("[data-test-logon-screen]");
  await expect(login).toHaveAttribute("data-source-logon-theme","win10");
  await expect(login).toHaveAttribute("data-source-logon-renderer","win10");
  await expect(login).toHaveAttribute("data-source-shell-status","partial");
  await expect(login).toHaveCSS("background-image",/win10\.743e8c13\.webp/);
  const avatar=login.locator('[data-test-source-logon-avatar="win10"]');
  await expect(avatar.locator("img")).toHaveAttribute(
    "src","/assets/images/guest-win10.a110df5a.webp");
  await expect(login.locator(".source-win11-logon__overlay"))
    .toHaveCSS("background-color","rgba(0, 0, 0, 0.5)");
  await expect(login.locator(".source-win11-logon__signin"))
    .toHaveCSS("border-radius","0px");
  await login.getByRole("button",{name:"Other user"}).click();
  await expect(login.getByRole("dialog",{name:"Account login"})).toBeVisible();
  await login.getByRole("button",{name:"Back"}).click();
  await login.getByRole("button",{name:"Power options"}).click();
  await expect(login.locator('[data-test-logon-restart]')).toBeVisible();
  await login.locator('[data-test-avatar="win7"]').click();
  const desktop=page.locator("[data-test-main-screen]");
  await expect(desktop).toBeVisible();
  await expect(desktop).toHaveAttribute("data-theme","win10");
});

test("original Windows 8/8.1 Guest logon uses purple source screen and 150px avatar",async({page})=>{
  for(const theme of ["win8","win81"] as const){
    await page.goto("/?theme="+theme);
    const login=page.locator("[data-test-logon-screen]");
    await expect(login).toHaveAttribute("data-source-theme-id",theme);
    await expect(login).toHaveAttribute("data-source-logon-theme","win8");
    await expect(login).toHaveAttribute("data-source-logon-renderer","win8");
    await expect(login).toHaveAttribute("data-source-shell-status","partial");
    await expect(login).toHaveCSS("background-color","rgb(24, 0, 83)");
    const avatar=login.locator('[data-test-source-logon-avatar="win8"]');
    await expect(avatar.locator("img")).toHaveAttribute(
      "src","/assets/images/guest-win8.265e68f5.webp");
    await expect(avatar.locator("img")).toHaveAttribute("width","150");
    await expect(login.getByRole("button",{name:"Sign in as Guest"})).toBeVisible();
    await login.getByRole("button",{name:"Switch user"}).click();
    await expect(login.getByRole("dialog",{name:"Account login"})).toBeVisible();
    await login.getByRole("button",{name:"Back"}).click();
    await login.getByRole("button",{name:"Power options"}).click();
    await expect(login.locator("[data-test-logon-restart]")).toBeVisible();
    await avatar.click();
    const desktop=page.locator("[data-test-main-screen]");
    await expect(desktop).toBeVisible();
    await expect(desktop).toHaveAttribute("data-theme",theme);
  }
});

/* Source XP running and foreground button source paints on real Computer
 * minimize/restore lifecycle in both desktop and mobile browser projects. */
for(const [theme,property,opened,openedHover,active,activeHover] of [["winxp","backgroundColor","rgb(57, 125, 243)","rgb(85, 160, 255)","rgb(26, 80, 184)","rgb(49, 106, 221)"],["winxpE","backgroundImage","rgb(69, 140, 196)","rgb(46, 117, 173)","rgb(12, 83, 139)","rgb(42, 113, 169)"],["winxpG","backgroundColor","rgb(195, 204, 165)","rgb(212, 222, 181)","rgb(141, 151, 126)","rgb(164, 177, 138)"],["winxpN","backgroundImage","rgb(105, 119, 128)","rgb(78, 93, 107)","rgb(43, 53, 65)","rgb(98, 109, 117)"],["winxpR","backgroundImage","rgb(148, 197, 239)","rgb(80, 157, 224)","rgb(68, 109, 165)","rgb(125, 179, 215)"],["winxpS","backgroundImage","rgb(255, 255, 255)","rgb(217, 218, 232)","rgb(97, 107, 120)","rgb(126, 136, 149)"],["winxpZ","backgroundImage","rgb(125, 125, 125)","rgb(90, 90, 90)","rgb(60, 60, 60)","rgb(107, 107, 107)"]] as const){
  test("original "+theme+" taskbar application source hover and focus",async({page})=>{
    await page.goto("/?theme="+theme);
    await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
    await page.locator('[data-test-desktop-icon="computer"]').dblclick();
    const win=page.locator('[data-test-window="computer"]');
    await expect(win).toBeVisible();
    const item=page.locator('[data-test-taskbar-pin="computer"][data-test-taskbar-pin-running="true"],[data-test-taskbar-running-group="computer"]');
    await expect(item).toHaveCount(1);
    await expect(item).toHaveClass(/is-active/);
    await expect(item.locator("img")).toHaveCSS("width","22px");
    const paint=()=>item.evaluate((el,prop)=>getComputedStyle(el)[prop as "backgroundColor"|"backgroundImage"],property);
    expect(await paint()).toContain(active);
    await item.hover();
    expect(await paint()).toContain(activeHover);
    await win.locator('[data-source-window-control="minimize"]').click();
    await expect(win).toBeHidden();
    await expect(item).not.toHaveClass(/is-active/);
    expect(await paint()).toContain(opened);
    await item.hover();
    expect(await paint()).toContain(openedHover);
    await item.click();
    await expect(win).toBeVisible();
    await expect(item).toHaveClass(/is-active/);
  });
}

/* Pinned XP startbutton-wrapper source: curved 80px pseudo skin with 20px
 * original icon + italic source "start" label, and distinct N/Z pressed
 * gradients. Real Start menu click state, all seven XP variants and RTL. */
for(const {theme,idle,hover,active} of [{"theme":"winxp","idle":"linear-gradient(","hover":null,"active":null},{"theme":"winxpE","idle":"rgb(19, 61, 102)","hover":null,"active":null},{"theme":"winxpG","idle":"rgb(66, 107, 47)","hover":null,"active":null},{"theme":"winxpN","idle":"rgb(0, 0, 7)","hover":"rgb(79, 92, 106)","active":"rgb(30, 52, 31)"},{"theme":"winxpR","idle":"rgb(59, 91, 126)","hover":null,"active":null},{"theme":"winxpS","idle":"rgb(0, 103, 0)","hover":null,"active":null},{"theme":"winxpZ","idle":"rgb(78, 31, 1)","hover":null,"active":"rgb(89, 34, 1)"}] as const){
  test("XP "+theme+" original Start button source geometry and state",async({page})=>{
    await page.goto("/?theme="+theme);
    await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
    const button=page.locator('[data-test-start-button]');
    await expect(button).toBeVisible();
    await expect(button).toHaveAttribute("aria-expanded","false");
    await expect(page.locator('[data-test-taskbar="base"]')).toHaveCSS("height","40px");
    await expect(button.locator("img")).toHaveAttribute("src",
      "/assets/images/start-button-winxp.a3485adf.webp");
    await expect(button.locator("img")).toHaveCSS("width","20px");
    const paint=()=>button.evaluate(el=>getComputedStyle(el,"::before").backgroundImage);
    const label=await button.evaluate(el=>getComputedStyle(el,"::after").content);
    expect(label).toBe('"start"');
    expect(await paint()).toContain(idle);
    const dimensions=await button.boundingBox();
    expect(dimensions).not.toBeNull();
    expect(dimensions!.width).toBeGreaterThan(40);
    expect(dimensions!.x+dimensions!.width).toBeLessThanOrEqual(
      page.viewportSize()!.width+1);
    await button.hover();
    await expect(button).toHaveCSS("filter","brightness(1.1) contrast(1.1)");
    if(hover)expect(await paint()).toContain(hover);
    await button.click();
    await expect(button).toHaveAttribute("aria-expanded","true");
    await expect(button).toHaveClass(/is-active/);
    await expect(button).toHaveCSS("filter","brightness(0.9) contrast(1.1)");
    await expect(page.locator('[data-test-start-menu]')).toBeVisible();
    if(active)expect(await paint()).toContain(active);
    await button.click();
    await expect(button).toHaveAttribute("aria-expanded","false");
    await expect(page.locator('[data-test-start-menu]')).toHaveCount(0);
  });
}
test("XP source Start button mirrors the curved end and shadows in RTL",async({page})=>{
  await page.goto("/?theme=winxp");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  const button=page.locator('[data-test-start-button]');
  await page.evaluate(()=>document.documentElement.setAttribute("dir","rtl"));
  await expect(button).toBeVisible();
  const before=await button.evaluate(el=>{
    const css=getComputedStyle(el,"::before");
    return {right:css.right,radius:css.borderTopLeftRadius};
  });
  expect(before.right).toBe("-18px");
  expect(before.radius).toBe("50%");
});

/* Pinned theme-win7-classic-scss.js Basic 3/4 actual shell regressions,
 * desktop + mobile. These partial skins still require source screenshot pairing. */
for(const source of [
  {theme:"basic-3",surface:"rgb(0, 0, 0)",accent:"rgb(128, 0, 128)",
   idle:"rgb(0, 128, 0)",border:"rgb(0, 128, 0)"},
  {theme:"basic-4",surface:"rgb(255, 255, 255)",accent:"rgb(0, 0, 0)",
   idle:"rgb(255, 255, 255)",border:"rgb(125, 125, 125)"}
] as const){
  test("source "+source.theme+" high contrast taskbar Start and window state",async({page})=>{
    await page.goto("/?theme="+source.theme);
    await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
    const desk=page.locator('[data-test-main-screen]');
    await expect(desk).toHaveAttribute("data-theme",source.theme);
    const bar=page.locator('[data-test-taskbar="base"]');
    await expect(bar).toHaveCSS("height","52px");
    await expect(bar).toHaveCSS("background-color",source.surface);
    await expect(bar).toHaveCSS("border-top-color",source.border);
    const start=page.locator('[data-test-start-button]');
    await expect(start.locator("img")).toHaveAttribute("src",
      "/assets/images/start-button-classic.ec7b0b9f.webp");
    await expect(start.locator("img")).toHaveCSS("width","26px");
    expect(await start.evaluate(el=>getComputedStyle(el,"::after").content))
      .toBe('"Start"');
    await start.click();
    await expect(start).toHaveClass(/is-active/);
    const menu=page.locator('[data-test-start-menu]');
    await expect(menu).toBeVisible();
    await expect(menu).toHaveCSS("background-color",source.surface);
    await start.click();
    await expect(menu).toHaveCount(0);
    await page.locator('[data-test-desktop-icon="computer"]').dblclick();
    const win=page.locator('[data-test-window="computer"]');
    await expect(win).toBeVisible();
    await expect(win).toHaveCSS("border-top-left-radius","0px");
    await expect(win).toHaveCSS("background-color",source.surface);
    await expect(win).toHaveCSS("backdrop-filter","none");
    const title=win.locator(".windows-window__titlebar");
    await expect(title).toHaveCSS("background-color",source.accent);
    await expect(title).toHaveCSS("color","rgb(255, 255, 255)");
    await expect(win.locator(".windows-window__body"))
      .toHaveCSS("background-color",source.surface);
    await win.locator('[data-source-window-control="maximize"]').click();
    await expect(win).toHaveClass(/is-maximized/);
    const bounds=await win.boundingBox();
    const viewport=page.viewportSize()!;
    expect(bounds).not.toBeNull();
    expect(Math.abs(viewport.height-bounds!.y-bounds!.height-52))
      .toBeLessThanOrEqual(2);
    await win.locator('[data-source-window-control="restore"]').click();
    await page.locator('[data-test-desktop-icon="bin"]').dblclick();
    await expect(page.locator('[data-test-window="bin"]')).toBeVisible();
    await expect(title).toHaveCSS("background-color",source.idle);
  });
  test("source "+source.theme+" high contrast Desktop/taskbar context actions",async({page})=>{
    await page.goto("/?theme="+source.theme);
    await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
    const icons=page.locator("#desktop-icons");
    await icons.click({button:"right",position:{x:260,y:200}});
    const menu=icons.locator("[data-test-desktop-menu]");
    await expect(menu).toBeVisible();
    await expect(menu).toHaveCSS("background-color",source.surface);
    const refresh=menu.getByRole("menuitem",{name:"Refresh",exact:true});
    await refresh.hover();
    await expect(refresh).toHaveCSS("background-color",source.accent);
    await expect(refresh).toHaveCSS("color","rgb(255, 255, 255)");
    await page.keyboard.press("Escape");
    await expect(menu).toHaveCount(0);
    await page.locator(".windows-taskbar__running").click({
      button:"right",position:{x:15,y:5}
    });
    const popup=page.locator('[data-test-taskbar-context="background"]');
    await expect(popup).toBeVisible();
    await expect(popup).toHaveCSS("background-color",source.surface);
    await popup.locator('[data-test-taskbar-context-action="taskmgr"]').click();
    await expect(page.locator('[data-test-window="taskmgr"]')).toBeVisible();
  });
}

/* Immutable final original theme-win7-scss.js Basic1 and
 * theme-win7-classic-scss.js (Basic2 inherits the unmodified classic base).
 * Test live geometry, Start and window behavior on desktop and mobile. */
test("basic-1 original non-glass Win7 window controls and taskbar remain operational",async({page})=>{
  await page.goto("/?theme=basic-1");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  const bar=page.locator('[data-test-taskbar="base"]');
  await expect(bar).toHaveCSS("height","40px");
  await expect(bar).toHaveCSS("background-image",/linear-gradient\(to right/);
  const start=page.locator('[data-test-start-button]');
  await expect(start.locator("img")).toHaveAttribute("src",
    "/assets/images/start-button.b35eae12.webp");
  await start.click();
  await expect(page.locator('[data-test-start-menu]')).toBeVisible();
  await expect(page.locator('[data-test-start-menu] .windows-startmenu__right'))
    .toHaveCSS("padding-top","0px");
  await start.click();
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const win=page.locator('[data-test-window="computer"]');
  await expect(win).toBeVisible();
  await expect(win).toHaveCSS("backdrop-filter","none");
  await expect(win).toHaveCSS("border-bottom-left-radius","0px");
  const controls=win.locator(".windows-window__buttons button");
  await expect(controls).toHaveCount(3);
  await expect(controls.first()).toHaveCSS("width","40px");
  await expect(controls.last()).toHaveCSS("width","40px");
  await controls.nth(1).click();
  await expect(win).toHaveClass(/is-maximized/);
  const size=await win.boundingBox(),vp=page.viewportSize()!;
  expect(size).not.toBeNull();
  expect(Math.abs(vp.height-size!.y-size!.height-40)).toBeLessThanOrEqual(2);
  await controls.nth(1).click();
  await controls.last().click();
  await expect(win).toHaveCount(0);
});
test("basic-2 original classic base colors, Start and taskbar geometry",async({page})=>{
  await page.goto("/?theme=basic-2");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  const bar=page.locator('[data-test-taskbar="base"]');
  await expect(bar).toHaveCSS("height","52px");
  await expect(bar).toHaveCSS("background-color","rgb(212, 208, 200)");
  const start=page.locator('[data-test-start-button]');
  await expect(start.locator("img")).toHaveAttribute("src",
    "/assets/images/start-button-classic.ec7b0b9f.webp");
  expect(await start.evaluate(el=>getComputedStyle(el,"::after").content))
    .toBe('"Start"');
  await start.click();
  await expect(page.locator('[data-test-start-menu]')).toBeVisible();
  await expect(page.locator('[data-test-start-menu]'))
    .toHaveCSS("background-color","rgb(212, 208, 200)");
  await start.click();
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const win=page.locator('[data-test-window="computer"]');
  await expect(win).toHaveCSS("background-color","rgb(212, 208, 200)");
  await expect(win).toHaveCSS("border-top-left-radius","0px");
  await expect(win.locator(".windows-window__titlebar"))
    .toHaveCSS("background-image",/linear-gradient\(to right/);
  const controls=win.locator(".windows-window__buttons button");
  await expect(controls).toHaveCount(3);
  await expect(controls.last()).toHaveCSS("width","20px");
  await controls.nth(1).click();
  await expect(win).toHaveClass(/is-maximized/);
  const size=await win.boundingBox(),vp=page.viewportSize()!;
  expect(size).not.toBeNull();
  expect(Math.abs(vp.height-size!.y-size!.height-52)).toBeLessThanOrEqual(2);
  await controls.nth(1).click();
  await page.locator('[data-test-desktop-icon="bin"]').dblclick();
  await expect(win.locator(".windows-window__titlebar"))
    .toHaveCSS("background-image",/linear-gradient\(to right/);
});
test("basic-2 source classic popup retains real Desktop and Task Manager actions",async({page})=>{
  await page.goto("/?theme=basic-2");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  const icons=page.locator("#desktop-icons");
  await icons.click({button:"right",position:{x:260,y:200}});
  const desktopMenu=icons.locator('[data-test-desktop-menu]');
  await expect(desktopMenu).toHaveCSS("background-color","rgb(212, 208, 200)");
  const refresh=desktopMenu.getByRole("menuitem",{name:"Refresh",exact:true});
  await refresh.hover();
  await expect(refresh).toHaveCSS("background-color","rgb(10, 36, 106)");
  await page.keyboard.press("Escape");
  await page.locator(".windows-taskbar__running").click({
    button:"right",position:{x:15,y:5}
  });
  const context=page.locator('[data-test-taskbar-context="background"]');
  await expect(context).toHaveCSS("background-color","rgb(212, 208, 200)");
  await context.locator('[data-test-taskbar-context-action="taskmgr"]').click();
  await expect(page.locator('[data-test-window="taskmgr"]')).toBeVisible();
});

/* Pinned final theme-win7-scss.js uses the Win7 window chrome
 * across its four Aero IDs; palette per-ID still unverified.
 * Assert actual live renderer, desktop menu, window interactions. */
for(const aero of ["aero-1","aero-2","aero-3","aero-4"] as const){
  test(aero+" inherits original Win7 Aero window geometry and interactive shell",async({page})=>{
    await page.goto("/?theme="+aero);
    const logon=page.locator('[data-test-logon-screen]');
    await expect(logon).toHaveAttribute("data-source-logon-theme","win7");
    await expect(logon).toHaveAttribute("data-source-shell-status","partial");
    await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
    await expect(page.locator('[data-test-main-screen]'))
      .toHaveAttribute("data-theme",aero);
    await expect(page.locator('[data-test-taskbar="base"]'))
      .toHaveCSS("height","40px");
    const start=page.locator('[data-test-start-button]');
    await expect(start.locator("img")).toHaveAttribute("src",
      "/assets/images/start-button.b35eae12.webp");
    await start.click();
    await expect(page.locator('[data-test-start-menu]')).toBeVisible();
    await expect(start).toHaveAttribute("aria-expanded","true");
    await start.click();
    await expect(page.locator('[data-test-start-menu]')).toHaveCount(0);
    await page.locator('[data-test-desktop-icon="computer"]').dblclick();
    const win=page.locator('[data-test-window="computer"]');
    await expect(win).toBeVisible();
    await expect(win).toHaveCSS("border-top-left-radius","7px");
    await expect(win).toHaveCSS("border-top-color","rgb(0, 0, 0)");
    await expect(win).toHaveCSS("padding-top","6px");
    await expect(win).toHaveCSS("background-image",/linear-gradient/);
    await win.getByRole("button",{name:"Maximize Computer"}).click();
    await expect(win).toHaveClass(/is-maximized/);
    const bounds=await win.boundingBox(),size=page.viewportSize()!;
    expect(bounds).not.toBeNull();
    expect(Math.abs(size.height-bounds!.y-bounds!.height-40))
      .toBeLessThanOrEqual(2);
    await win.getByRole("button",{name:"Maximize Computer"}).click();
    await expect(win).not.toHaveClass(/is-maximized/);
    await win.getByRole("button",{name:"Close Computer"}).click();
    await expect(win).toHaveCount(0);
    const icons=page.locator("#desktop-icons");
    await icons.click({button:"right",position:{x:260,y:200}});
    const menu=icons.locator("[data-test-desktop-menu]");
    await expect(menu).toBeVisible();
    await menu.getByRole("menuitem",{name:"Refresh",exact:true}).click();
    await expect(menu).toHaveCount(0);
  });
}

/* Original source .win7 taskbar__wrapper and glass texture were
 * imported from immutable theme-win7-scss.js; verifies actual live
 * taskbar layering, source Win7 Start metrics and opened group state. */
for(const theme of ["win7","aero-1","aero-2","aero-3","aero-4"] as const){
  test(theme+" paints original source Win7 Aero taskbar and remains interactive",async({page})=>{
    await page.goto("/?theme="+theme);
    await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
    const desktop=page.locator('[data-test-main-screen]');
    await expect(desktop).toHaveAttribute("data-theme",theme);
    const taskbar=page.locator('[data-test-taskbar="base"]');
    await expect(taskbar).toHaveCSS("height","40px");
    await expect(taskbar).toHaveCSS("background-image",/linear-gradient/);
    expect(await taskbar.evaluate(el=>getComputedStyle(el).backgroundImage))
      .toContain("to right");
    const pseudo=await taskbar.evaluate(el=>{
      const style=getComputedStyle(el,"::before");
      return {content:style.content,background:style.backgroundImage,
        shadow:style.boxShadow};
    });
    expect(pseudo.content).toBe('""');
    expect(pseudo.background).toContain("linear-gradient");
    expect(pseudo.shadow).toContain("inset");
    const start=page.locator('[data-test-start-button]');
    await expect(start).toHaveCSS("width","54px");
    await expect(start.locator("img")).toHaveCSS("width","40px");
    await start.click();
    await expect(page.locator('[data-test-start-menu]')).toBeVisible();
    await start.click();
    await page.locator('[data-test-desktop-icon="computer"]').dblclick();
    await expect(page.locator('[data-test-window="computer"]')).toBeVisible();
    const group=page.locator('[data-test-taskbar-running-group="computer"]');
    await expect(group).toBeVisible();
    await expect(group).toHaveCSS("border-top-color","rgba(0, 0, 0, 0.533)");
    await group.click();
    await expect(page.locator('[data-test-window="computer"]')).toHaveCount(0);
    await group.click();
    await expect(page.locator('[data-test-window="computer"]')).toBeVisible();
  });
}
