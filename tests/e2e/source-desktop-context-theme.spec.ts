import {expect,test,type Page} from "@playwright/test";

/** Exact source menu palettes pinned to original legacy-win7 at
 * 26b9f0ce7a1665dee89a7c81824bec09e2c75776:
 * theme-winxp-scss.js, theme-win10-scss.js and theme-win11-scss.js.
 * This tests actual DOM surfaces and working menu behavior, not CSS text.
 */
const variants=[
  {theme:"win95",surface:"rgb(189, 190, 189)",border:"rgb(57, 60, 57)",
    radius:"0px",hover:"rgb(0, 0, 123)",text:"rgb(255, 255, 255)"},
  {theme:"win98",surface:"rgb(192, 199, 200)",border:"rgb(57, 60, 57)",
    radius:"0px",hover:"rgb(6, 8, 166)",text:"rgb(255, 255, 255)"},
  {theme:"win2k",surface:"rgb(212, 208, 200)",border:"rgb(57, 60, 57)",
    radius:"0px",hover:"rgb(8, 39, 103)",text:"rgb(255, 255, 255)"},
  {
    theme:"win31",surface:"rgb(255, 255, 255)",border:"rgb(0, 0, 0)",
    radius:"0px",hover:"rgb(8, 10, 189)",text:"rgb(255, 255, 255)"
  },
  {
    theme:"winxp",surface:"rgb(255, 255, 255)",border:"rgb(172, 168, 153)",
    radius:"0px",hover:"rgb(49, 106, 197)",text:"rgb(255, 255, 255)"
  },
  {
    theme:"win10",surface:"rgb(238, 238, 238)",border:"rgb(160, 160, 160)",
    radius:"0px",hover:"rgb(255, 255, 255)",text:"rgb(0, 0, 0)"
  },
  {
    theme:"win11",surface:"rgb(249, 249, 249)",border:"rgba(0, 0, 0, 0.067)",
    radius:"6px",hover:"rgb(240, 240, 240)",text:"rgb(26, 26, 26)"
  }
] as const;

async function login(page:Page,theme:string){
  await page.goto("/?theme="+theme);
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await expect(page.locator('[data-test-main-screen]')).toHaveAttribute("data-theme",theme);
}
for(const source of variants){
  test(source.theme+" original Desktop popup menu keeps source palette and View submenu functionality",async({page})=>{
    await login(page,source.theme);
    const icons=page.locator("#desktop-icons");
    await icons.click({button:"right",position:{x:260,y:200}});
    let menu=icons.locator("[data-test-desktop-menu]");
    await expect(menu).toBeVisible();
    await expect(menu).toHaveCSS("background-color",source.surface);
    await expect(menu).toHaveCSS("border-top-color",source.border);
    await expect(menu).toHaveCSS("border-top-left-radius",source.radius);
    const refresh=menu.getByRole("menuitem",{name:"Refresh",exact:true});
    await refresh.hover();
    await expect(refresh).toHaveCSS("background-color",source.hover);
    await expect(refresh).toHaveCSS("color",source.text);
    const view=menu.locator("[data-test-desktop-view]");
    await view.click();
    await expect(page.locator("[data-test-desktop-background-submenu]").getByRole("menuitemradio",{name:"Large icons"})).toBeVisible();
    await expect(menu).toHaveCSS("background-color",source.surface);
    await page.keyboard.press("Escape");
    await expect(menu).toHaveCount(0);

    // Same source skin applies to actual Desktop icon context actions.
    await page.locator('[data-test-desktop-icon="computer"]').click({button:"right"});
    menu=icons.locator("[data-test-desktop-menu]");
    await expect(menu).toBeVisible();
    await expect(menu).toHaveCSS("background-color",source.surface);
    await expect(menu).toHaveCSS("border-top-color",source.border);
    await expect(menu).toHaveCSS("border-top-left-radius",source.radius);
    await expect(menu.locator('[data-test-desktop-item-action="open"]')).toBeVisible();
    await menu.locator('[data-test-desktop-item-action="open"]').click();
    await expect(page.locator('[data-test-window="computer"]')).toBeVisible();
  });

  test(source.theme+" taskbar background popup uses source skin and working Task Manager action",async({page})=>{
    await login(page,source.theme);
    const taskbar=page.locator(".windows-taskbar");
    if(source.theme==="win11"){
      await taskbar.click({button:"right",position:{x:12,y:10}});
    }else{
      await page.locator(".windows-taskbar__running").click({
        button:"right",position:{x:15,y:5}
      });
    }
    const menu=page.locator('[data-test-taskbar-context="background"]');
    await expect(menu).toBeVisible();
    await expect(menu).toHaveCSS("background-color",source.surface);
    await expect(menu).toHaveCSS("border-top-color",source.border);
    await expect(menu).toHaveCSS("border-top-left-radius",source.radius);
    const properties=menu.locator('[data-test-taskbar-context-action="properties"]');
    await properties.hover();
    if(source.theme==="winxp"){
      // Source taskbar XP uses its existing white surface and blue hover,
      // while previous implementation preserved XP-specific taskbar layout.
      await expect(properties).toHaveCSS("background-color",source.hover);
    }else{
      await expect(properties).toHaveCSS("background-color",source.hover);
    }
    await menu.locator('[data-test-taskbar-context-action="taskmgr"]').click();
    await expect(menu).toHaveCount(0);
    await expect(page.locator('[data-test-window="taskmgr"]')).toBeVisible();
  });
}
