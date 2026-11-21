import {expect,test,type Page} from "@playwright/test";

/** Frozen legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776.
 * The original Win31, Win9x and Win8 family .winui-menu styles must apply
 * to the *real* detached Start program context, not just Desktop menus.
 * This remains bounded paint/action acceptance, not visual screenshot parity.
 */
async function programContext(page:Page,theme:string){
  await page.goto("/?theme="+theme);
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.locator("[data-test-start-button]").click();
  const start=page.locator("[data-test-start-menu]");
  await expect(start).toHaveAttribute("data-source-start-theme",theme);
  if(theme==="win31"){
    await start.locator('[data-test-win31-group="simu-programs"]').click();
    const button=start.locator('[data-test-win31-group-window="simu-programs"] [data-test-win31-program="notepad"]');
    await expect(button).toBeVisible();
    await button.click({button:"right"});
  }else if(theme==="win95"||theme==="win98"||theme==="win2k"){
    await start.locator('[data-test-win9x-branch="programs"]').click();
    const button=start.locator('[data-test-win9x-submenu="programs"] [data-test-win9x-program="notepad"]');
    await expect(button).toBeVisible();
    await button.click({button:"right"});
  }else{
    const button=start.locator('[data-test-win8-start-group-kind="programs"] [data-test-program="notepad"]');
    await expect(button).toBeVisible();
    await button.click({button:"right"});
  }
  const popup=page.locator('body > [data-test-start-program-context="notepad"]');
  await expect(popup).toHaveAttribute("data-source-start-context-theme",theme);
  const pin=popup.locator('[data-test-start-context-action="pin"]');
  await expect(pin).toBeEnabled();
  return {popup,pin};
}

test("original Win31 Program Manager context keeps black/white + indigo menu",async({page})=>{
  const {popup,pin}=await programContext(page,"win31");
  await expect(popup).toHaveCSS("background-color","rgb(255, 255, 255)");
  await expect(popup).toHaveCSS("border-top-color","rgb(0, 0, 0)");
  await expect(popup).toHaveCSS("border-top-left-radius","0px");
  await expect(pin).toHaveCSS("font-weight","700");
  await pin.hover();
  await expect(pin).toHaveCSS("background-color","rgb(8, 10, 189)");
  await expect(pin).toHaveCSS("color","rgb(255, 255, 255)");
  await pin.click();
  await expect(page.locator('[data-test-taskbar-pin="notepad"]')).toBeVisible();
});

for(const [theme,surface,accent] of [
  ["win95","rgb(189, 190, 189)","rgb(0, 0, 123)"],
  ["win98","rgb(192, 199, 200)","rgb(6, 8, 166)"],
  ["win2k","rgb(212, 208, 200)","rgb(8, 39, 103)"]
] as const){
  test("original Win9x Start program context and working pin: "+theme,async({page})=>{
    const {popup,pin}=await programContext(page,theme);
    await expect(popup).toHaveCSS("background-color",surface);
    await expect(popup).toHaveCSS("border-top-color","rgb(57, 60, 57)");
    await expect(popup).toHaveCSS("border-top-left-radius","0px");
    expect(await popup.evaluate(el=>getComputedStyle(el).boxShadow)).toContain("inset");
    await pin.hover();
    await expect(pin).toHaveCSS("background-color",accent);
    await expect(pin).toHaveCSS("color","rgb(255, 255, 255)");
    await pin.click();
    await expect(page.locator('[data-test-taskbar-pin="notepad"]')).toBeVisible();
  });
}

for(const theme of ["win8","win81"] as const){
  test("original Win8 Start program context keeps gutter and source hover: "+theme,async({page})=>{
    const {popup,pin}=await programContext(page,theme);
    await expect(popup).toHaveCSS("background-color","rgb(240, 240, 240)");
    await expect(popup).toHaveCSS("border-top-color","rgba(0, 0, 0, 0.4)");
    expect(await popup.evaluate(el=>getComputedStyle(el,"::before").content)).toBe('""');
    await pin.hover();
    await expect(pin).toHaveCSS("background-color","rgba(146, 200, 253, 0.2)");
    await expect(pin).toHaveCSS("box-shadow",/rgb\(138, 207, 255\)/);
    await pin.click();
    await expect(page.locator('[data-test-taskbar-pin="notepad"]')).toBeVisible();
  });
}
