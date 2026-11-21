import {expect,test,type Page} from "@playwright/test";
async function logon(page:Page,theme:"win7"|"winxp"|"win11"="win7"){
  await page.goto("/?theme="+theme);
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
}
test("source pinned app item context can Open/Unpin and running app can Close",async({page})=>{
  await logon(page,"winxp");
  const desktop=page.locator('[data-test-desktop-icon="computer"]');
  await desktop.click({button:"right"});
  await page.locator('[data-test-desktop-item-action="pin"]').click();
  const pin=page.locator('[data-test-taskbar-pin="computer"]');
  await expect(pin).toBeVisible();
  await pin.click({button:"right"});
  let menu=page.locator('[data-test-taskbar-context="item"]');
  await expect(menu.locator("[data-test-taskbar-context-action]"))
    .toHaveText(["Open","Unpin from taskbar"]);
  await menu.locator('[data-test-taskbar-context-action="open"]').click();
  await expect(page.locator('[data-test-window="computer"]')).toBeVisible();
  await pin.click({button:"right"});
  menu=page.locator('[data-test-taskbar-context="item"]');
  await expect(menu.locator("[data-test-taskbar-context-action]"))
    .toHaveText(["Unpin from taskbar","Close window"]);
  await menu.locator('[data-test-taskbar-context-action="close"]').click();
  await expect(page.locator('[data-test-window="computer"]')).toHaveCount(0);
  await expect(pin).toBeVisible();
  await pin.click({button:"right"});
  await page.locator('[data-test-taskbar-context-action="pin"]').click();
  await expect(pin).toHaveCount(0);
});
test("source taskbar background menu keeps unavailable controls disabled",async({page})=>{
  await logon(page,"win11");
  // Source Win11 centers its Start and running items; with no running
  // windows, the running-items lane has zero width. Right-click the actual
  // empty taskbar background instead.
  await page.locator(".windows-taskbar").click({
    button:"right",position:{x:12,y:10}
  });
  let menu=page.locator('[data-test-taskbar-context="background"]');
  await expect(menu.locator("[data-test-taskbar-context-action]")).toHaveText([
    "Toolbars","Cascade windows","Show windows stacked",
    "Show windows side by side","Show desktop","Start Task Manager","Properties"
  ]);
  for(const action of ["toolbar","cascade","stack","side"]){
    await expect(menu.locator('[data-test-taskbar-context-action="'+action+'"]'))
      .toBeDisabled();
  }
  await menu.locator('[data-test-taskbar-context-action="taskmgr"]').click();
  await expect(page.locator('[data-test-window="taskmgr"]')).toBeVisible();
  await expect(menu).toHaveCount(0);
  // Source Win11 centers its Start and running items; with no running
  // windows, the running-items lane has zero width. Right-click the actual
  // empty taskbar background instead.
  await page.locator(".windows-taskbar").click({
    button:"right",position:{x:12,y:10}
  });
  menu=page.locator('[data-test-taskbar-context="background"]');
  await menu.locator('[data-test-taskbar-context-action="show-desktop"]').click();
  await expect(page.locator('[data-test-window="taskmgr"]')).not.toBeVisible();
});
test("source taskbar context dismisses on Escape and outside pointer",async({page})=>{
  await logon(page);
  const taskbar=page.locator(".windows-taskbar__running");
  await taskbar.click({button:"right",position:{x:15,y:5}});
  await expect(page.locator("[data-test-taskbar-context]")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("[data-test-taskbar-context]")).toHaveCount(0);
  await taskbar.click({button:"right",position:{x:15,y:5}});
  await page.locator("#desktop-icons").click({position:{x:320,y:220}});
  await expect(page.locator("[data-test-taskbar-context]")).toHaveCount(0);
});
