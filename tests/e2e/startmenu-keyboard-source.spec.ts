import {expect,test,type Page} from "@playwright/test";

async function start(page:Page,theme:"win7"|"winxp"|"win11"){
  await page.goto("/?theme="+theme);
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  const button=page.getByRole("button",{name:"Open Start menu"});
  await button.click();
  const menu=page.locator('[data-test-start-menu]');
  await expect(menu).toBeVisible();
  return {button,menu};
}
test("source Start Escape dismisses menu and returns focus to taskbar",async({page})=>{
  for(const theme of ["win7","winxp","win11"] as const){
    const {button,menu}=await start(page,theme);
    await page.keyboard.press("Escape");
    await expect(menu).toHaveCount(0);
    await expect(button).toBeFocused();
  }
});
test("source Start dismisses after clicking outside, not when interacting within",async({page})=>{
  const {menu}=await start(page,"win7");
  await menu.locator("[data-test-all-programs]").click();
  await expect(menu).toBeVisible();
  const desktop=page.locator("#desktop-icons");
  await desktop.click({position:{x:255,y:12}});
  await expect(menu).toHaveCount(0);
});
test("source WinXP does not inherit Win7 inline search; Win11 Search Enter opens app",async({page})=>{
  let opened=await start(page,"winxp");
  await expect(opened.menu.locator("[data-test-startmenu-search]")).toHaveCount(0);
  await expect(opened.menu.locator("[data-test-startmenu-xp-header]")).toBeVisible();
  opened=await start(page,"win11");
  const search=opened.menu.getByRole("textbox",{name:"Search programs and files"});
  await search.fill("Calculator");
  await expect(opened.menu.getByRole("button",{name:"Calculator"})).toBeVisible();
  await search.press("Enter");
  await expect(opened.menu).toHaveCount(0);
  await expect(page.locator('[data-test-window="calc"]')).toBeVisible();
});
