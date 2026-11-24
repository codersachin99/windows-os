import {test,expect,type Locator} from "@playwright/test";
async function paint(menu:Locator){
  await expect(menu).toBeVisible();
  await expect(menu).toHaveCSS("background-color","rgba(42, 46, 50, 0.867)");
  await expect(menu).toHaveCSS("border-top-left-radius","3px");
  await expect(menu).toHaveCSS("border-top-color","rgba(255, 255, 255, 0.333)");
}
test("Kubuntu source desktop, Explorer and portaled Start menus",async({page})=>{
  await page.goto("/?theme=kubuntu");
  await page.locator('[data-test-source-logon-avatar="kubuntu"]').click({timeout:12000});
  const desktop=page.locator("#desktop-icons");
  const area=(await desktop.boundingBox())!;
  await desktop.click({button:"right",position:{x:Math.min(260,area.width-12),y:Math.min(200,area.height-12)}});
  const root=desktop.locator("[data-test-desktop-menu]");
  await paint(root);
  await root.getByRole("menuitem",{name:"Refresh",exact:true}).focus();
  await expect(root.getByRole("menuitem",{name:"Refresh",exact:true})).toHaveCSS("border-top-color","rgb(61, 174, 233)");
  await root.locator("[data-test-desktop-view]").click();
  await paint(desktop.locator("[data-test-desktop-background-submenu]"));
  await page.keyboard.press("Escape");
  await expect(root).toHaveCount(0);
  for(const id of ["computer","bin"]){
    await desktop.locator('[data-test-desktop-icon="'+id+'"]').dblclick();
    const win=page.locator('[data-test-window="'+id+'"]').first();
    await expect(win.locator(".explorer-navigation")).toHaveCSS("background-color","rgb(42, 46, 50)");
    await expect(win.locator(".explorer-content")).toHaveCSS("background-color","rgb(42, 46, 50)");
    await expect(win.locator(".explorer-address__location-wrapper")).toHaveCSS("background-color","rgba(255, 255, 255, 0.2)");
    const content=win.locator(".explorer-content"),box=(await content.boundingBox())!;
    await content.click({button:"right",position:{x:Math.max(10,box.width-12),y:Math.max(10,box.height-12)}});
    const menu=win.locator('[data-test-explorer-context="background"]');
    await paint(menu);
    await menu.locator("[data-test-explorer-context-view]").click();
    await paint(menu.locator("[data-test-explorer-background-submenu]"));
    await page.keyboard.press("Escape");
    await win.locator('[data-source-window-control="close"]').click();
  }
  await page.locator("[data-test-start-button]").click();
  const start=page.locator("[data-test-kubuntu-start]");
  await start.locator("[data-test-start-search]").fill("Notepad");
  await start.locator('[data-test-start-group="apps"] [data-test-program="notepad"]').click({button:"right"});
  const popup=page.locator('body > [data-test-start-program-context="notepad"]');
  await paint(popup);
  await popup.locator('[data-test-start-context-action="open"]').click();
  await expect(page.locator('[data-test-window="notepad"]')).toBeVisible();
});
