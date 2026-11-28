import {expect,test,type Page} from "@playwright/test";

/**
 * Frozen legacy-win7 src/modules/shell/startmenu-base.js Win7 family:
 * watcher.isOpen -> if opened and !isTouchDevice(), nextTick(focusSearch).
 * Do not automatically summon a touch-device keyboard on open.
 */
async function openStart(page:Page,theme:string){
  await page.goto("/?theme="+theme);
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await expect(page.locator("#desktop-icons")).toBeVisible();
  await page.getByRole("button",{name:"Open Start menu"}).click();
  const start=page.locator('[data-test-start-menu]');
  await expect(start).toBeVisible();
  return start.getByRole("textbox",{name:"Search programs and files"});
}

for(const theme of ["win7","winvista","basic-1"]){
  test("source "+theme+" Start only automatically focuses Search on non-touch browsers",async({page},info)=>{
    const search=await openStart(page,theme);
    await expect(search).toBeVisible();
    if(info.project.name==="chromium-mobile"){
      // Touch input stays unfocused until an explicit interaction,
      // matching startmenu-base.js isTouchDevice() guard.
      await expect(search).not.toBeFocused();
      await search.click();
      await expect(search).toBeFocused();
    }else{
      await expect(search).toBeFocused();
    }
    await search.fill("Calc");
    await expect(search).toHaveValue("Calc");
  });
}
