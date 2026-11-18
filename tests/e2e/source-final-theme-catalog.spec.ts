import {expect,test} from "@playwright/test";

/**
 * Final source app.config.json contains 36 named themeScreens entries,
 * including shared screen families. Full source-exact visuals are NOT
 * implied by recognizing a source theme ID or showing a Win7 fallback.
 */
test("source theme variants select exact login screen families and report fallback",async({page})=>{
  const cases=[
    ["aero-3","win7","win7","pending"],
    ["winxpE","winxp","winxp","pending"],
    ["win31","win31","win31","pending"],
    ["win95","win95","win95","pending"],
    ["win98","win98","win98","pending"],
    ["win2k","win2k","win2k","pending"],
    ["win10","win10","win10","pending"],
    ["win8","win8","win8","pending"],
    ["win81","win8","win8","pending"],
    ["win11dark","win11","win11","pending"],
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
  // The full Win11-dark artwork and UI personalities have not been
  // migrated. Recognition is not a false visual-parity acceptance.
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

test("original Win11 logon uses source guest-win10 art, dark overlay and Guest sign-in",async({page})=>{
  await page.goto("/?theme=win11dark");
  const login=page.locator("[data-test-logon-screen]");
  await expect(login).toHaveAttribute("data-source-logon-renderer","win11");
  await expect(login).toHaveCSS("background-image",/win11\.fc00c43d\.webp/);
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
  await expect(login).toHaveAttribute("data-source-shell-status","pending");
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
    await expect(login).toHaveAttribute("data-source-shell-status","pending");
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
