import {expect,test,type Page} from "@playwright/test";
const desktop="/EXTERNAL/computer/drive0/Users/Guest/Desktop";
async function guest(page:Page,theme:"win7"|"winxp"|"win11"){
  await page.goto("/?theme="+theme);
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.getByRole("button",{name:"Open Start menu"}).click();
}
test("source Start program context uses real Pin/Unpin and Desktop shortcut",async({page})=>{
  await guest(page,"win11");
  const tile=page.locator('[data-test-program="notepad"]');
  await tile.click({button:"right"});
  let menu=page.locator('[data-test-start-program-context="notepad"]');
  await expect(menu.locator("[data-test-start-context-action]")).toHaveText([
    "Open","Pin to taskbar","Send to Desktop","Properties"
  ]);
  await expect(menu.locator('[data-test-start-context-action="properties"]')).toBeDisabled();
  await menu.locator('[data-test-start-context-action="pin"]').click();
  await expect(page.locator('[data-test-taskbar-pin="notepad"]')).toBeVisible();
  await tile.click({button:"right"});
  menu=page.locator('[data-test-start-program-context="notepad"]');
  await expect(menu.locator('[data-test-start-context-action="pin"]'))
    .toHaveText("Unpin from taskbar");
  await menu.locator('[data-test-start-context-action="send-desktop"]').click();
  await expect(page.locator('[data-test-desktop-file="'+desktop+'/Notepad.lnk"]'))
    .toBeVisible();
  await tile.click({button:"right"});
  await menu.locator('[data-test-start-context-action="pin"]').click();
  await expect(page.locator('[data-test-taskbar-pin="notepad"]')).toHaveCount(0);
});
test("source XP Start context Escape closes only program menu, then Start",async({page})=>{
  await guest(page,"winxp");
  const tile=page.locator('[data-test-program="calc"]');
  await tile.click({button:"right"});
  await expect(page.locator('[data-test-start-program-context="calc"]')).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator('[data-test-start-program-context]')).toHaveCount(0);
  await expect(page.locator("[data-test-start-menu]")).toBeVisible();
  await expect(tile).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.locator("[data-test-start-menu]")).toHaveCount(0);
});
test("source Start program context remains in the mobile viewport",async({page})=>{
  await guest(page,"win7");
  const tile=page.locator('[data-test-program="notepad"]');
  await tile.click({button:"right"});
  const menu=page.locator('[data-test-start-program-context="notepad"]');
  const box=await menu.boundingBox();
  expect(box).not.toBeNull();
  const viewport=page.viewportSize()!;
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.x+box!.width).toBeLessThanOrEqual(viewport.width+1);
  expect(box!.y+box!.height).toBeLessThanOrEqual(viewport.height+1);
});
