import {expect,test,type Page} from "@playwright/test";

/**
 * Frozen original legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776
 * src/modules/themes/theme-winvista-scss.js .winvista .winui-menu.
 * WinVista shares Win7/Vista source menu palette and gutter, but is NOT
 * in the target's source Aero or Basic theme ID sets.
 */
async function vista(page:Page){
  await page.goto("/?theme=winvista");
  const login=page.locator("[data-test-logon-screen]");
  await expect(login).toHaveAttribute("data-source-theme-id","winvista");
  await expect(login).toHaveAttribute("data-source-logon-theme","winvista");
  await expect(login).toHaveAttribute("data-source-shell-status","partial");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await expect(page.locator("[data-test-main-screen]"))
    .toHaveAttribute("data-theme","winvista");
}
async function originalMenuPaint(menu:ReturnType<Page["locator"]>){
  await expect(menu).toBeVisible();
  await expect(menu).toHaveCSS("background-color","rgb(241, 241, 241)");
  await expect(menu).toHaveCSS("border-top-color","rgb(151, 151, 151)");
  await expect(menu).toHaveCSS("border-top-left-radius","0px");
  await expect(menu).toHaveCSS("box-shadow",/0px 0px 0px 2px/);
  await expect(menu,"pinned source icon/checkmark gutter")
    .toHaveCSS("position",/^(absolute|fixed)$/);
  const gutter=await menu.evaluate(element=>({
    content:getComputedStyle(element,"::before").content,
    width:getComputedStyle(element,"::before").width
  }));
  expect(gutter.content).toBe('""');
  expect(gutter.width).toBe("2px");
}

test("Vista Desktop background and Computer icon context use original WinUI menu paint and actions",async({page})=>{
  await vista(page);
  const desktop=page.locator("#desktop-icons");
  await desktop.click({button:"right",position:{x:260,y:200}});
  let menu=desktop.locator("[data-test-desktop-menu]");
  await originalMenuPaint(menu);
  const refresh=menu.getByRole("menuitem",{name:"Refresh"});
  await refresh.hover();
  await expect(refresh).toHaveCSS("background-image",/linear-gradient/);
  await expect(refresh).toHaveCSS("border-top-color","rgb(170, 221, 250)");
  await page.keyboard.press("Escape");
  await expect(desktop).toBeFocused();
  await page.locator('[data-test-desktop-icon="computer"]').click({button:"right"});
  menu=desktop.locator("[data-test-desktop-menu]");
  await originalMenuPaint(menu);
  const open=menu.locator('[data-test-desktop-item-action="open"]');
  await expect(open).toBeFocused();
  await open.click();
  await expect(page.locator('[data-test-window="computer"]')).toBeVisible();
});

test("Vista taskbar context has source pale panel and real Task Manager action",async({page})=>{
  await vista(page);
  await page.locator(".windows-taskbar__running")
    .click({button:"right",position:{x:15,y:5}});
  const menu=page.locator('[data-test-taskbar-context="background"]');
  await originalMenuPaint(menu);
  const manager=menu.locator('[data-test-taskbar-context-action="taskmgr"]');
  await manager.hover();
  await expect(manager).toHaveCSS("background-image",/linear-gradient/);
  await manager.click();
  await expect(page.locator('[data-test-window="taskmgr"]')).toBeVisible();
});

test("Vista Computer and Recycle Bin use original Explorer context skin and View",async({page})=>{
  await vista(page);
  for(const id of ["computer","bin"] as const){
    await page.locator('[data-test-desktop-icon="'+id+'"]').dblclick();
    const win=page.locator('[data-test-window="'+id+'"]');
    await expect(win).toBeVisible();
    const content=win.locator(".explorer-content");
    const bounds=await content.boundingBox();
    expect(bounds).not.toBeNull();
    await content.click({button:"right",position:{
      x:Math.max(10,bounds!.width-12),y:Math.max(10,bounds!.height-12)
    }});
    const menu=win.locator('[data-test-explorer-context="background"]');
    await originalMenuPaint(menu);
    const view=menu.locator('[data-test-explorer-context-view]');
    await expect(view).toBeFocused();
    await view.hover();
    await expect(view).toHaveCSS("background-image",/linear-gradient/);
    await view.click();
    const child=menu.locator('[data-test-explorer-background-submenu]');
    await originalMenuPaint(child);
    await expect(child.getByRole("menuitemradio")).toHaveCount(8);
    await page.keyboard.press("Escape");
    await expect(menu).toHaveCount(0);
    await win.getByRole("button",{name:/^Close /}).click();
  }
});
