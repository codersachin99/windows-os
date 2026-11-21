import {expect,test,type Page} from "@playwright/test";
async function openAppearance(page:Page,theme="aero-2"){
  await page.goto("/?theme="+theme);
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  const desktop=page.locator("#desktop-icons");
  await desktop.click({button:"right",position:{x:260,y:200}});
  await desktop.locator("[data-test-desktop-personalize]").click();
  const win=page.locator('[data-test-window="personalize"]');
  await expect(win).toBeVisible();
  await win.locator("[data-test-personalize-appearance-link]").click();
  return win;
}
const tint=(page:Page)=>page.locator("[data-test-main-screen]").evaluate(el=>
  getComputedStyle(el).getPropertyValue("--theme-color").trim());

test("source ChangeAppearance previews 32 colors and Cancel/window close rolls back",async({page})=>{
  const win=await openAppearance(page);
  await expect(win.locator("[data-test-color-item]")).toHaveCount(32);
  await expect(win.locator('[data-test-color-item="#5986ca"]'))
    .toHaveAttribute("aria-pressed","true");
  await expect(win.locator("[data-test-color-transparency]")).toBeChecked();
  expect(await tint(page)).toBe("rgba(89, 134, 202, 0.65)");
  await win.locator('[data-test-color-item="#d13438"]').click();
  expect(await tint(page)).toBe("rgba(209, 52, 56, 0.65)");
  await win.locator("[data-test-color-cancel]").click();
  expect(await tint(page)).toBe("rgba(89, 134, 202, 0.65)");
  await win.locator("[data-test-personalize-appearance-link]").click();
  await win.locator('[data-test-color-item="#00b294"]').click();
  await win.locator(".windows-window__close").click();
  await expect(win).toHaveCount(0);
  expect(await tint(page)).toBe("rgba(89, 134, 202, 0.65)");
});

test("source Aero Save persists color/transparency, theme switch restores palette",async({page})=>{
  const win=await openAppearance(page);
  await win.locator('[data-test-color-item="#d13438"]').click();
  await win.locator("[data-test-color-transparency]").uncheck();
  expect(await tint(page)).toBe("#d13438");
  await win.locator("[data-test-color-save]").click();
  await page.reload();
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  expect(await tint(page)).toBe("#d13438");
  const desktop=page.locator("#desktop-icons");
  await desktop.click({button:"right",position:{x:260,y:200}});
  await desktop.locator("[data-test-desktop-personalize]").click();
  const again=page.locator('[data-test-window="personalize"]');
  await again.locator("[data-test-personalize-appearance-link]").click();
  await expect(again.locator('[data-test-color-item="#d13438"]'))
    .toHaveAttribute("aria-pressed","true");
  await expect(again.locator("[data-test-color-transparency]")).not.toBeChecked();
  await again.locator("[data-test-color-cancel]").click();
  await again.locator('[data-test-personalize-theme="aero-4"]').click();
  await expect(page.locator("[data-test-main-screen]")).toHaveAttribute("data-theme","aero-4");
  expect(await tint(page)).toBe("#9f81bf");
});

test("source Basic theme does not expose Aero color editor",async({page})=>{
  await page.goto("/?theme=basic-1");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  const desktop=page.locator("#desktop-icons");
  await desktop.click({button:"right",position:{x:260,y:200}});
  await desktop.locator("[data-test-desktop-personalize]").click();
  const win=page.locator('[data-test-window="personalize"]');
  await expect(win.locator("[data-test-personalize-appearance-link]")).toHaveCount(0);
});
