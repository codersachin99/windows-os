import {test,expect,type Locator} from "@playwright/test";
async function paint(menu:Locator){
  await expect(menu).toBeVisible();
  await expect(menu).toHaveCSS("background-image",/linear-gradient\(rgb\(85, 85, 85\), rgb\(51, 51, 51\)\)/);
  await expect(menu).toHaveCSS("border-top-left-radius","4px");
  await expect(menu).toHaveCSS("border-top-color","rgb(136, 136, 136)");
}
test("Aero Noir desktop and Explorer menus preserve source paint and real cascade",async({page})=>{
  await page.goto("/?theme=aeroNoir");
  await page.locator('[data-test-source-logon-avatar="aeroNoir"]').click({timeout:12000});
  const desktop=page.locator("#desktop-icons");
  const area=(await desktop.boundingBox())!;
  await desktop.click({button:"right",position:{x:Math.min(260,area.width-12),y:Math.min(200,area.height-12)}});
  const root=desktop.locator("[data-test-desktop-menu]");
  await paint(root);
  const refresh=root.getByRole("menuitem",{name:"Refresh",exact:true});
  await refresh.focus();
  await expect.poll(()=>refresh.evaluate(el=>getComputedStyle(el,"::before").opacity)).toBe("0.6");
  await root.locator("[data-test-desktop-view]").click();
  await paint(desktop.locator("[data-test-desktop-background-submenu]"));
  await page.keyboard.press("Escape");
  await expect(root).toHaveCount(0);
  for(const id of ["computer","bin"]){
    await desktop.locator('[data-test-desktop-icon="'+id+'"]').dblclick();
    const win=page.locator('[data-test-window="'+id+'"]').first();
    await expect(win.locator(".explorer-navigation")).toHaveCSS("background-color","rgb(51, 51, 51)");
    await expect(win.locator(".explorer-content")).toHaveCSS("background-color","rgb(85, 85, 85)");
    await expect(win.locator(".explorer-status")).toHaveCSS("background-color","rgb(68, 68, 68)");
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
  const start=page.locator('[data-test-start-menu][data-source-start-theme="aeroNoir"]');
  await start.locator("[data-test-startmenu-search]").fill("Notepad");
  await start.locator('[data-test-program="notepad"]').click({button:"right"});
  const popup=page.locator('body > [data-test-start-program-context="notepad"]');
  await paint(popup);
  await popup.locator('[data-test-start-context-action="open"]').click();
  const notepad=page.locator('[data-test-window="notepad"]');
  await expect(notepad).toBeVisible();
  const bar=notepad.locator(".notepad-menu");
  await expect(bar).toHaveCSS("background-image",/linear-gradient/);
  await bar.getByRole("button",{name:"View",exact:true}).click();
  await paint(bar.locator(".notepad-menu__dropdown"));
});
test("Aero Noir Explorer uses original list selection across view changes",async({page})=>{
  await page.goto("/?theme=aeroNoir");
  await page.locator('[data-test-source-logon-avatar="aeroNoir"]').click({timeout:12000});
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const win=page.locator('[data-test-window="computer"]').first();
  const desktop=win.getByRole("button",{name:"Desktop",exact:true});
  await desktop.click();
  await expect(desktop).toHaveAttribute("aria-current","location");
  await expect(desktop).toHaveCSS("backdrop-filter","brightness(0.7)");
  await win.locator('input[type="file"][aria-label="Upload files"]').setInputFiles({
    name:"Aero Noir Selection.txt",mimeType:"text/plain",buffer:Buffer.from("Guest file")
  });
  const item=win.locator('[data-test-explorer-item="Aero Noir Selection.txt"]');
  const view=win.getByRole("combobox",{name:"Explorer view"});
  for(const mode of ["details","tiles","content"]){
    await view.selectOption(mode);
    await item.click();
    await expect(item).toHaveClass(/is-selected/);
    await expect(item).toHaveCSS("background-image",/linear-gradient/);
    await expect(item).toHaveCSS("border-top-left-radius","3px");
    await expect(item).toHaveCSS("backdrop-filter","brightness(0.7)");
    await expect(page.locator('[data-test-window="notepad"]')).toHaveCount(0);
  }
});
