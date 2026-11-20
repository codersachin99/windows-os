import {expect,test} from "@playwright/test";

/**
 * Final source app.config.json contains 36 named themeScreens entries,
 * including shared screen families. Full source-exact visuals are NOT
 * implied by recognizing a source theme ID or showing a Win7 fallback.
 */
test("source theme variants select exact login screen families and report fallback",async({page})=>{
  const cases=[
    ["aero-3","win7","win7","pending"],
    ["winxpE","winxp","winxp","partial"],
    ["win31","win31","win31","partial"],
    ["win95","win95","win95","partial"],
    ["win98","win98","win98","partial"],
    ["win2k","win2k","win2k","partial"],
    ["win10","win10","win10","partial"],
    ["win8","win8","win8","partial"],
    ["win81","win8","win8","partial"],
    ["win11dark","win11","win11","partial"],
    ["winLP","winLS","win7-fallback","pending"],
    ["aeroNoir","aeroNoir","win7-fallback","pending"],
    ["kubuntu","kubuntu","win7-fallback","pending"],
    ["onebit","onebit","win7-fallback","pending"]
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
