import {expect,test} from "@playwright/test";

/**
 * Final source app.config.json contains 36 named themeScreens entries,
 * including shared screen families. Full source-exact visuals are NOT
 * implied by recognizing a source theme ID or showing a Win7 fallback.
 */
test("source theme variants select exact login screen families and report fallback",async({page})=>{
  const cases=[
    ["aero-3","win7","win7","pending"],
    ["winxpE","winxp","win7-fallback","pending"],
    ["win11dark","win11","win7-fallback","pending"],
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
