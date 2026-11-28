import {expect,test,type Page} from "@playwright/test";

/** Pinned legacy-win7@26b9f0c theme-win8-scss.js; Win81 inherits Win8
 * context/popup family, but keeps its own desktop wallpaper/Start button.
 * These tests use actual CSS and working Guest app actions.
 */
const cases=["win8","win81"] as const;
const surface="rgb(240, 240, 240)";
const border="rgba(0, 0, 0, 0.4)";
const hover="rgba(146, 200, 253, 0.2)";
async function guest(page:Page,theme:typeof cases[number]){
  await page.goto("/?theme="+theme);
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await expect(page.locator('[data-test-main-screen]')).toHaveAttribute("data-theme",theme);
}
for(const theme of cases){
  test(theme+" Desktop background and Computer item contexts use source Win8 popup colors",async({page})=>{
    await guest(page,theme);
    const desktop=page.locator("#desktop-icons");
    await desktop.click({button:"right",position:{x:260,y:200}});
    let menu=desktop.locator("[data-test-desktop-menu]");
    await expect(menu).toBeVisible();
    await expect(menu).toHaveCSS("background-color",surface);
    await expect(menu).toHaveCSS("border-top-color",border);
    await expect(menu).toHaveCSS("border-top-left-radius","0px");
    const refresh=menu.getByRole("menuitem",{name:"Refresh",exact:true});
    await refresh.hover();
    await expect(refresh).toHaveCSS("background-color",hover);
    await expect(refresh).toHaveCSS("box-shadow",/rgb\(138, 207, 255\)/);
    await page.keyboard.press("Escape");
    await expect(menu).toHaveCount(0);
    await page.locator('[data-test-desktop-icon="computer"]').click({button:"right"});
    menu=desktop.locator("[data-test-desktop-menu]");
    await expect(menu).toHaveCSS("background-color",surface);
    await menu.locator('[data-test-desktop-item-action="open"]').click();
    await expect(page.locator('[data-test-window="computer"]')).toBeVisible();
  });

  test(theme+" Computer root/View context submenus preserve source hover and real view actions",async({page})=>{
    await guest(page,theme);
    await page.locator('[data-test-desktop-icon="computer"]').dblclick();
    const win=page.locator('[data-test-window="computer"]');
    const area=win.locator(".explorer-content");
    const bounds=await area.boundingBox();
    expect(bounds).not.toBeNull();
    await area.click({button:"right",position:{
      x:Math.max(10,bounds!.width-12),y:Math.max(10,bounds!.height-12)
    }});
    const menu=win.locator('[data-test-explorer-context="background"]');
    await expect(menu).toBeVisible();
    await expect(menu).toHaveCSS("background-color",surface);
    await expect(menu).toHaveCSS("border-top-color",border);
    const refresh=menu.getByRole("menuitem",{name:"Refresh",exact:true});
    await refresh.hover();
    await expect(refresh).toHaveCSS("background-color",hover);
    await expect(refresh).toHaveCSS("box-shadow",/rgb\(138, 207, 255\)/);
    await menu.locator("[data-test-explorer-context-view]").click();
    const submenu=menu.locator("[data-test-explorer-background-submenu]");
    await expect(submenu).toBeVisible();
    await expect(submenu).toHaveCSS("background-color",surface);
    await expect(submenu.getByRole("menuitemradio")).toHaveCount(8);
    await submenu.getByRole("menuitemradio",{name:"Details"}).click();
    await expect(win.locator(".explorer-list")).toHaveClass(/has-details/);
  });

  test(theme+" taskbar background context adopts original Win8 menu skin",async({page})=>{
    await guest(page,theme);
    await page.locator(".windows-taskbar__running").click({
      button:"right",position:{x:15,y:5}
    });
    const menu=page.locator('[data-test-taskbar-context="background"]');
    await expect(menu).toBeVisible();
    await expect(menu).toHaveCSS("background-color",surface);
    await expect(menu).toHaveCSS("border-top-color",border);
    await expect(menu).toHaveCSS("border-top-left-radius","0px");
    const manager=menu.locator('[data-test-taskbar-context-action="taskmgr"]');
    await manager.hover();
    await expect(manager).toHaveCSS("background-color",hover);
    await manager.click();
    await expect(page.locator('[data-test-window="taskmgr"]')).toBeVisible();
  });
}
