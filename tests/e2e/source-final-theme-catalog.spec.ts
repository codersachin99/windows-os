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
