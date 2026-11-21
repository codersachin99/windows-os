import {expect,test,type Page,type Locator} from "@playwright/test";

/** Frozen legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776:
 * theme-win7-classic-scss.js .winui-menu [aria-disabled] row/label rules.
 * Real source-locked Computer/Bin context menus must keep disabled commands
 * readable in Classic and High Contrast palettes with directional emboss.
 */
async function login(page:Page,theme:string,dir:"ltr"|"rtl"){
  await page.goto("/?theme="+theme);
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await expect(page.locator('[data-test-main-screen]'))
    .toHaveAttribute("data-theme",theme);
  await page.locator("html").evaluate((el,d)=>el.setAttribute("dir",d),dir);
  await expect(page.locator("[data-test-main-screen]")).toHaveCSS("direction",dir);
}

async function disabledClassic(button:Locator,dir:"ltr"|"rtl"){
  await expect(button).toBeVisible();
  await expect(button).toBeDisabled();
  await expect(button).toHaveCSS("opacity","1");
  await expect(button).toHaveCSS("color","rgb(123, 123, 123)");
  const textShadow=await button.evaluate(el=>getComputedStyle(el).textShadow);
  expect(textShadow).toMatch(dir==="rtl"?/-1px 1px/:/\s1px 1px/);
  // Presence of emboss does not create a pointer action.
  await expect(button).toBeDisabled();
}

async function openBackground(win:Locator){
  const area=win.locator(".explorer-content");
  const bounds=await area.boundingBox();
  expect(bounds).not.toBeNull();
  await area.click({button:"right",position:{
    x:Math.max(10,bounds!.width-12),y:Math.max(10,bounds!.height-12)
  }});
  const root=win.locator('[data-test-explorer-context="background"]');
  await expect(root).toBeVisible();
  return root;
}
for(const theme of ["basic-2","basic-3","basic-4"] as const){
  for(const dir of ["ltr","rtl"] as const){
    test(theme+" "+dir+" source Classic Computer/Bin disabled root and nested actions are embossed",async({page})=>{
      await login(page,theme,dir);
      // Bin source has real unavailable actions even when empty.
      await page.locator('[data-test-desktop-icon="bin"]').dblclick();
      const bin=page.locator('[data-test-window="bin"]');
      await expect(bin).toBeVisible();
      const binMenu=await openBackground(bin);
      await disabledClassic(binMenu.getByRole("menuitem",{name:"Empty Recycle Bin"}),dir);
      await disabledClassic(binMenu.locator('[data-test-explorer-context-upload]'),dir);
      await disabledClassic(binMenu.getByRole("menuitem",{name:"Properties"}),dir);
      await page.keyboard.press("Escape");
      await expect(binMenu).toHaveCount(0);
      await expect(bin).toBeVisible();

      await page.locator('[data-test-desktop-icon="computer"]').dblclick();
      const computer=page.locator('[data-test-window="computer"]');
      await expect(computer).toBeVisible();
      const computerMenu=await openBackground(computer);
      await disabledClassic(computerMenu.getByRole("menuitem",{name:"Properties"}),dir);
      await page.keyboard.press("Escape");
      await expect(computerMenu).toHaveCount(0);

      // Use a real Guest file so the item context path and its separate
      // Send to child exercise the same source disabled-command paint.
      await computer.locator(".explorer-navigation__home")
        .filter({hasText:"Documents"}).click();
      await computer.locator('input[type="file"][aria-label="Upload files"]')
        .setInputFiles({name:"Classic Disabled Source.txt",
          mimeType:"text/plain",buffer:Buffer.from("source guest bytes")});
      const item=computer.locator(
        '[data-test-explorer-item="Classic Disabled Source.txt"]');
      await expect(item).toBeVisible();
      await item.click({button:"right"});
      const itemMenu=computer.locator('[data-test-explorer-context="item"]');
      await disabledClassic(itemMenu.locator(
        '[data-test-explorer-item-action="properties"]'),dir);
      await itemMenu.locator('[data-test-explorer-item-send-to]').click();
      const child=itemMenu.locator('[data-test-explorer-sendto-submenu]');
      await expect(child).toBeVisible();
      await expect(child.locator(
        '[data-test-explorer-item-send-to-kind="compress"]')).toBeEnabled();
      await expect(child.locator(
        '[data-test-explorer-item-send-to-kind="desktop"]')).toBeEnabled();
      await page.keyboard.press("Escape");
      await expect(itemMenu).toHaveCount(0);
      await expect(item).toBeVisible();
    });
  }
}
