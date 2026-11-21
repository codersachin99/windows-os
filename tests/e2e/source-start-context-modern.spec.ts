import {expect,test,type Page} from "@playwright/test";

/**
 * Source-locked legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776:
 * src/modules/themes/theme-win10-scss.js .win10 .winui-menu,
 * src/modules/themes/theme-win11-scss.js .win11 .winui-menu
 * plus the .win11dark palette. The context is portaled under <body>,
 * never under its source-themed Start menu panel.
 */
async function openNotepadContext(page:Page,theme:"win10"|"win11"|"win11dark"){
  await page.goto("/?theme="+theme);
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.locator("[data-test-start-button]").click();
  const start=page.locator("[data-test-start-menu]");
  await expect(start).toHaveAttribute("data-source-start-theme",theme);
  const tile=start.locator('[data-test-program="notepad"]');
  await expect(tile).toBeVisible();
  await tile.click({button:"right"});
  const popup=page.locator('body > [data-test-start-program-context="notepad"]');
  await expect(popup).toHaveAttribute("data-source-start-context-theme",theme);
  const pin=popup.locator('[data-test-start-context-action="pin"]');
  await expect(pin).toBeEnabled();
  return {start,popup,pin};
}

test("Win10 dark Start intentionally opens original light Win10 system context popup",async({page})=>{
  const {start,popup,pin}=await openNotepadContext(page,"win10");
  await expect(start).toHaveCSS("background-color","rgb(31, 31, 31)");
  await expect(popup).toHaveCSS("background-color","rgb(238, 238, 238)");
  await expect(popup).toHaveCSS("color","rgb(0, 0, 0)");
  await expect(popup).toHaveCSS("border-top-color","rgb(160, 160, 160)");
  await expect(popup).toHaveCSS("border-top-left-radius","0px");
  await pin.hover();
  await expect(pin).toHaveCSS("background-color","rgb(255, 255, 255)");
  await expect(pin).toHaveCSS("color","rgb(0, 0, 0)");
  await expect(pin).toHaveCSS("border-top-color","rgba(0, 0, 0, 0)");
  await pin.click();
  await expect(page.locator('[data-test-taskbar-pin="notepad"]')).toBeVisible();
});

for(const [theme,surface,textColor,border,hover] of [
  ["win11","rgb(249, 249, 249)","rgb(26, 26, 26)",
    "rgba(0, 0, 0, 0.067)","rgb(240, 240, 240)"],
  ["win11dark","rgb(36, 36, 36)","rgb(255, 255, 255)",
    "rgba(255, 255, 255, 0.067)","rgba(255, 255, 255, 0.067)"]
] as const){
  test("Win11 original light/dark system popup geometry and neutral hover: "+theme,async({page})=>{
    const {popup,pin}=await openNotepadContext(page,theme);
    await expect(popup).toHaveCSS("background-color",surface);
    await expect(popup).toHaveCSS("color",textColor);
    await expect(popup).toHaveCSS("border-top-color",border);
    await expect(popup).toHaveCSS("border-top-left-radius","6px");
    await expect(popup).toHaveCSS("padding-top","6px");
    await expect(pin).toHaveCSS("padding-left","32px");
    await pin.hover();
    await expect(pin).toHaveCSS("background-color",hover);
    await expect(pin).toHaveCSS("border-top-color","rgba(0, 0, 0, 0)");
    await pin.click();
    await expect(page.locator('[data-test-taskbar-pin="notepad"]')).toBeVisible();
  });
}
