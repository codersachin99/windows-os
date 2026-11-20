import {expect,test,type Page} from "@playwright/test";

/**
 * Original legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776
 * .win7/.win7-classic/.winxp .winui-menu palettes.
 *
 * The React StartProgram popup is PORTALED to document.body, outside
 * .windows-desktop. Its theme must be painted on the popup itself,
 * not accidentally inherited from Desktop or the system browser.
 */
async function openProgramMenu(page:Page,theme:string){
  await page.goto("/?theme="+theme);
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.locator("[data-test-start-button]").click();
  const start=page.locator("[data-test-start-menu]");
  await expect(start).toHaveAttribute("data-source-start-theme",theme);
  const tile=start.locator('[data-test-program="notepad"]');
  await tile.click({button:"right"});
  const popup=page.locator('[data-test-start-program-context="notepad"]');
  await expect(popup).toHaveAttribute("data-source-start-context-theme",theme);
  await expect(page.locator("body > .windows-startmenu__context")).toBeVisible();
  const pin=popup.locator('[data-test-start-context-action="pin"]');
  await expect(pin).toBeEnabled();
  return {start,tile,popup,pin};
}

for(const theme of ["win7","aero-1","aero-2","aero-3","aero-4","basic-1"] as const){
  test("original Win7 Aero Start context gutter, paint and launch: "+theme,async({page})=>{
    const {popup,pin}=await openProgramMenu(page,theme);
    await expect(popup).toHaveCSS("background-color","rgb(241, 241, 241)");
    await expect(popup).toHaveCSS("border-top-color","rgb(151, 151, 151)");
    await expect(popup).toHaveCSS("border-top-left-radius","0px");
    expect(await popup.evaluate(element=>
      getComputedStyle(element,"::before").content)).toBe('""');
    await pin.hover();
    await expect(pin).toHaveCSS("border-top-color","rgb(170, 221, 250)");
    const paint=await pin.evaluate(element=>getComputedStyle(element).backgroundImage);
    expect(paint).toContain("linear-gradient");
    await pin.click();
    await expect(page.locator('[data-test-taskbar-pin="notepad"]')).toBeVisible();
    await expect(popup).toHaveCount(0);
  });
}

for(const [theme,surface,border,highlight] of [
  ["basic-2","rgb(212, 208, 200)","rgb(57, 60, 57)","rgb(10, 36, 106)"],
  ["basic-3","rgb(0, 0, 0)","rgb(255, 255, 255)","rgb(128, 0, 128)"],
  ["basic-4","rgb(255, 255, 255)","rgb(0, 0, 0)","rgb(0, 0, 0)"]
] as const){
  test("original Win7 Classic Start context bevel and contrast: "+theme,async({page})=>{
    const {popup,pin}=await openProgramMenu(page,theme);
    await expect(popup).toHaveCSS("background-color",surface);
    await expect(popup).toHaveCSS("border-top-color",border);
    await expect(popup).toHaveCSS("border-top-left-radius","0px");
    expect(await popup.evaluate(element=>getComputedStyle(element).boxShadow))
      .toContain("inset");
    await pin.hover();
    await expect(pin).toHaveCSS("background-color",highlight);
    await expect(pin).toHaveCSS("color","rgb(255, 255, 255)");
    await expect(popup.locator('[data-test-start-context-action="properties"]'))
      .toBeDisabled();
    await pin.click();
    await expect(page.locator('[data-test-taskbar-pin="notepad"]')).toBeVisible();
  });
}

for(const [theme,accent] of [
  ["winxp","rgb(49, 106, 197)"],
  ["winxpE","rgb(62, 157, 232)"],
  ["winxpG","rgb(147, 160, 112)"],
  ["winxpN","rgb(94, 129, 188)"],
  ["winxpR","rgb(51, 90, 168)"],
  ["winxpS","rgb(187, 183, 199)"],
  ["winxpZ","rgb(190, 190, 190)"]
] as const){
  test("original XP variant Start program context uses exact selection accent: "+theme,async({page})=>{
    const {popup,pin}=await openProgramMenu(page,theme);
    await expect(popup).toHaveCSS("background-color","rgb(255, 255, 255)");
    await expect(popup).toHaveCSS("border-top-color","rgb(172, 168, 153)");
    await expect(popup).toHaveCSS("font-family",/Tahoma/);
    await pin.hover();
    await expect(pin).toHaveCSS("background-color",accent);
    await expect(pin).toHaveCSS("color","rgb(255, 255, 255)");
    await pin.click();
    await expect(page.locator('[data-test-taskbar-pin="notepad"]')).toBeVisible();
  });
}
