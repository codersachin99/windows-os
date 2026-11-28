import {expect,test,type Page} from "@playwright/test";

/** Frozen legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776:
 * startmenu-base.js isVista()/searchStyle() plus its recent-program and
 * power-action surface, theme-winvista-scss.js .winvista .winui-menu.
 */
async function vistaGuest(page:Page){
  await page.goto("/?theme=winvista");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.locator("[data-test-start-button]").click();
  const menu=page.locator("[data-test-start-menu]");
  await expect(menu).toHaveAttribute("data-source-start-theme","winvista");
  return menu;
}

test("source Vista shared Start preserves real recent-program and power sections",async({page})=>{
  let menu=await vistaGuest(page);
  const power=menu.locator('[data-test-startmenu-power-action="shutdown"]');
  await expect(power).toHaveText("Shut down");
  await expect(menu.locator("[data-test-list-recent]")).toHaveCount(0);
  await menu.locator('[data-test-program="notepad"]').click();
  await expect(page.locator('[data-test-window="notepad"]')).toBeVisible();
  await page.locator("[data-test-start-button]").click();
  menu=page.locator("[data-test-start-menu]");
  const recent=menu.locator("[data-test-list-recent]");
  await expect(recent.locator('[data-test-recent-program="notepad"]')).toBeVisible();
  await menu.locator('[data-test-all-programs]').click();
  await expect(menu.locator("[data-test-list-recent]")).toHaveCount(0);
});

test("source Vista program context and functional pin use original Aero-style popup paint",async({page})=>{
  const menu=await vistaGuest(page);
  await menu.locator('[data-test-program="notepad"]').click({button:"right"});
  const popup=page.locator('body > [data-test-start-program-context="notepad"]');
  await expect(popup).toHaveAttribute("data-source-start-context-theme","winvista");
  await expect(popup).toHaveCSS("background-color","rgb(241, 241, 241)");
  await expect(popup).toHaveCSS("border-top-color","rgb(151, 151, 151)");
  await expect(popup).toHaveCSS("border-top-left-radius","0px");
  expect(await popup.evaluate(el=>getComputedStyle(el,"::before").content)).toBe('""');
  const pin=popup.locator('[data-test-start-context-action="pin"]');
  await pin.hover();
  await expect(pin).toHaveCSS("border-top-color","rgb(170, 221, 250)");
  await expect(pin).toHaveCSS("background-image",/linear-gradient/);
  await pin.click();
  await expect(page.locator('[data-test-taskbar-pin="notepad"]')).toBeVisible();
});

test("source Vista configured shared power button switches to logon",async({page})=>{
  await page.addInitScript(()=>{
    localStorage.setItem("windows-os:guest:start-preferences:v1",
      JSON.stringify({powerButtonAction:"switchuser",storeRecentApps:true}));
  });
  const menu=await vistaGuest(page);
  const power=menu.locator('[data-test-startmenu-power-action="switchuser"]');
  await expect(power).toHaveText("Switch user");
  await power.click();
  await expect(page.locator("[data-test-logon-screen]")).toBeVisible();
  await expect(page.locator("[data-test-main-screen]")).toHaveCount(0);
});
