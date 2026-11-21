import {expect,test,type Locator,type Page} from "@playwright/test";

/**
 * Source lock legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776:
 * src/modules/themes/theme-win7-scss.js -> .win7 .winui-menu
 * and matching sourceExplorerContextTheme.css.
 * This is NOT the separate basic-2/3/4 high-contrast menu.
 */
const win7Family=["win7","aero-1","aero-2","aero-3","aero-4","basic-1"] as const;

async function guest(page:Page,theme:string){
  await page.goto("/?theme="+theme);
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await expect(page.locator("[data-test-main-screen]")).toHaveAttribute("data-theme",theme);
}
async function sourceWin7Paint(menu:Locator){
  await expect(menu).toBeVisible();
  await expect(menu).toHaveCSS("background-color","rgb(241, 241, 241)");
  await expect(menu).toHaveCSS("border-top-color","rgb(151, 151, 151)");
  await expect(menu).toHaveCSS("border-top-left-radius","0px");
  await expect(menu).toHaveCSS("box-shadow",/0px 0px 0px 2px/);
  const pseudo=await menu.evaluate(el=>({
    content:getComputedStyle(el,"::before").content,
    width:getComputedStyle(el,"::before").width
  }));
  expect(pseudo).toEqual({content:'""',width:"2px"});
}

for(const theme of win7Family){
  test(theme+" real Desktop background and Computer context paint original Win7 menu and retain actions",async({page})=>{
    await guest(page,theme);
    const desktop=page.locator("#desktop-icons");
    await desktop.click({button:"right",position:{x:260,y:200}});
    let menu=desktop.locator('[data-test-desktop-menu]');
    await sourceWin7Paint(menu);
    const refresh=menu.getByRole("menuitem",{name:"Refresh",exact:true});
    await refresh.hover();
    await expect(refresh).toHaveCSS("border-top-color","rgb(170, 221, 250)");
    await expect(refresh).toHaveCSS("background-image",/linear-gradient/);
    const view=menu.locator('[data-test-desktop-view]');
    await view.click();
    await expect(menu.getByRole("menuitemradio",{name:/Large icons/})).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(menu).toHaveCount(0);
    await expect(desktop).toBeFocused();

    await page.locator('[data-test-desktop-icon="computer"]').click({button:"right"});
    menu=desktop.locator('[data-test-desktop-menu]');
    await sourceWin7Paint(menu);
    const open=menu.locator('[data-test-desktop-item-action="open"]');
    await expect(open).toBeFocused();
    await open.click();
    await expect(page.locator('[data-test-window="computer"]')).toBeVisible();
  });

  test(theme+" source taskbar menu paint and Task Manager remain functional",async({page})=>{
    await guest(page,theme);
    await page.locator(".windows-taskbar__running").click({
      button:"right",position:{x:15,y:5}
    });
    const menu=page.locator('[data-test-taskbar-context="background"]');
    await sourceWin7Paint(menu);
    const manager=menu.locator('[data-test-taskbar-context-action="taskmgr"]');
    await manager.hover();
    await expect(manager).toHaveCSS("background-image",/linear-gradient/);
    await expect(manager).toHaveCSS("border-top-color","rgb(170, 221, 250)");
    await manager.click();
    await expect(page.locator('[data-test-window="taskmgr"]')).toBeVisible();
  });
}

for(const theme of ["aero-2","aero-4","basic-1"] as const){
  test(theme+" Computer context retains the exact same source Win7 menu family",async({page})=>{
    await guest(page,theme);
    await page.locator('[data-test-desktop-icon="computer"]').dblclick();
    const computer=page.locator('[data-test-window="computer"]');
    const content=computer.locator(".explorer-content");
    const bounds=await content.boundingBox();
    expect(bounds).not.toBeNull();
    await content.click({button:"right",position:{
      x:Math.max(10,bounds!.width-12),y:Math.max(10,bounds!.height-12)
    }});
    const menu=computer.locator('[data-test-explorer-context="background"]');
    await sourceWin7Paint(menu);
    await menu.locator('[data-test-explorer-context-view]').click();
    const child=menu.locator('[data-test-explorer-background-submenu]');
    await sourceWin7Paint(child);
    await expect(child.getByRole("menuitemradio")).toHaveCount(8);
  });
}
