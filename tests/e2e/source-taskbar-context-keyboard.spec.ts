import {expect,test,type Page} from "@playwright/test";

/**
 * Pinned original legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776
 * src/modules/system/taskbar-base.js / shared WinUI menu commands.
 * Test actual taskbar pointer context, not programmatic button.focus().
 */
async function logon(page:Page,theme:string){
  await page.goto("/?theme="+theme);
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await expect(page.locator("[data-test-main-screen]"))
    .toHaveAttribute("data-theme",theme);
}

for(const theme of ["win7","winxp","win11dark","basic-1"] as const){
  test(theme+" taskbar background context enters first enabled action and restores background on Escape",async({page})=>{
    await logon(page,theme);
    const taskbar=page.locator(".windows-taskbar");
    // Source Win11 centers Start and running items; an empty lane has no
    // width. On all themes this left edge is actual taskbar background.
    await taskbar.click({button:"right",position:{x:12,y:10}});
    const menu=page.locator('[data-test-taskbar-context="background"]');
    await expect(menu).toBeVisible();
    for(const name of ["toolbar","cascade","stack","side"])
      await expect(menu.locator('[data-test-taskbar-context-action="'+name+'"]'))
        .toBeDisabled();
    const desktop=menu.locator('[data-test-taskbar-context-action="show-desktop"]');
    const manager=menu.locator('[data-test-taskbar-context-action="taskmgr"]');
    const properties=menu.locator('[data-test-taskbar-context-action="properties"]');
    await expect(desktop).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(manager).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(properties).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(desktop).toBeFocused();
    await page.keyboard.press("ArrowUp");
    await expect(properties).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(menu).toHaveCount(0);
    await expect(taskbar).toBeFocused();
    await expect(page.locator('[data-test-window="taskmgr"]')).toHaveCount(0);
  });
}

for(const theme of ["win7","winxp"] as const){
  test(theme+" pinned Computer context arrows and Escape return focus to original pin",async({page})=>{
    await logon(page,theme);
    await page.locator('[data-test-desktop-icon="computer"]').click({button:"right"});
    await page.locator('[data-test-desktop-item-action="pin"]').click();
    const pin=page.locator('[data-test-taskbar-pin="computer"]');
    await expect(pin).toBeVisible();
    await pin.click({button:"right"});
    const menu=page.locator('[data-test-taskbar-context="item"]');
    const open=menu.locator('[data-test-taskbar-context-action="open"]');
    const unpin=menu.locator('[data-test-taskbar-context-action="pin"]');
    await expect(menu.locator('[data-test-taskbar-context-action]'))
      .toHaveText(["Open","Unpin from taskbar"]);
    await expect(open).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(unpin).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(open).toBeFocused();
    await page.keyboard.press("ArrowUp");
    await expect(unpin).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(menu).toHaveCount(0);
    await expect(pin).toBeFocused();
    await expect(page.locator('[data-test-window="computer"]')).toHaveCount(0);
    await expect(pin).toBeVisible();
  });
}

test("unpinned running Computer taskbar menu focuses Close, Escape returns to running group",async({page})=>{
  await logon(page,"win7");
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const computer=page.locator('[data-test-window="computer"]');
  await expect(computer).toBeVisible();
  const running=page.locator('[data-test-taskbar-running-group="computer"]');
  await expect(running).toBeVisible();
  await running.click({button:"right"});
  const menu=page.locator('[data-test-taskbar-context="item"]');
  const close=menu.locator('[data-test-taskbar-context-action="close"]');
  await expect(menu.locator('[data-test-taskbar-context-action]')).toHaveText(["Pin to taskbar","Close window"]);
  await expect(menu.locator('[data-test-taskbar-context-action="pin"]')).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(close).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(menu.locator('[data-test-taskbar-context-action="pin"]')).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menu).toHaveCount(0);
  await expect(running).toBeFocused();
  await expect(computer).toBeVisible();
});
