import {expect,test,type Page} from "@playwright/test";

/** Source main.js DesktopMenu and ExplorerMenu open View/New via hover,
 * while touch and keyboard can still open with click and ArrowRight.
 */
async function logon(page:Page,theme:"win7"|"winxp"|"win11"){
  await page.goto("/?theme="+theme);
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
}
test("source Desktop View/New submenu opens on hover and keeps click idempotent",async({page},testInfo)=>{
  test.skip(testInfo.project.name.includes("mobile"),"Hover requires a pointer device");
  await logon(page,"winxp");
  const desktop=page.locator("#desktop-icons");
  await desktop.click({button:"right",position:{x:280,y:220}});
  const menu=desktop.locator("[data-test-desktop-menu]");
  const view=menu.locator("[data-test-desktop-view]");
  await view.hover();
  await expect(view).toHaveAttribute("aria-expanded","true");
  const child=desktop.locator('[data-test-desktop-background-submenu]');
  await expect(child).toHaveAttribute("aria-label","View");
  await expect(child.getByRole("menuitemradio",{name:/Large icons/})).toBeVisible();
  await view.click();
  await expect(view).toHaveAttribute("aria-expanded","true");
  const newer=menu.locator("[data-test-desktop-new]");
  await newer.hover();
  await expect(newer).toHaveAttribute("aria-expanded","true");
  await expect(view).toHaveAttribute("aria-expanded","false");
  await expect(child).toHaveAttribute("aria-label","New");
  await expect(child.locator("[data-test-desktop-new-text]")).toBeVisible();
  await newer.click();
  await expect(child.locator("[data-test-desktop-new-text]")).toBeVisible();
});
test("source Explorer View/New hover does not lose submenu before clicking",async({page},testInfo)=>{
  test.skip(testInfo.project.name.includes("mobile"),"Hover requires a pointer device");
  await logon(page,"win7");
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const explorer=page.locator('[data-test-window="computer"]');
  const area=explorer.locator(".explorer-content");
  const bounds=await area.boundingBox();
  if(!bounds)throw Error("Missing Explorer workspace");
  await area.click({button:"right",position:{x:Math.max(10,bounds.width-15),y:Math.max(10,bounds.height-15)}});
  const menu=explorer.locator('[data-test-explorer-context="background"]');
  const view=menu.locator("[data-test-explorer-context-view]");
  await view.hover();
  await expect(menu.getByRole("menuitemradio")).toHaveCount(8);
  await view.click();
  await expect(menu.getByRole("menuitemradio")).toHaveCount(8);
  const newer=menu.locator("[data-test-explorer-context-new]");
  await newer.hover();
  await expect(menu.getByRole("menuitemradio")).toHaveCount(0);
  await expect(menu.locator('[data-test-explorer-context-new-kind="folder"]')).toBeVisible();
  await newer.click();
  await expect(newer).toHaveAttribute("aria-expanded","true");
});
test("source Desktop and Explorer submenus also open with ArrowRight",async({page})=>{
  await logon(page,"win11");
  const desktop=page.locator("#desktop-icons");
  await desktop.click({button:"right",position:{x:240,y:210}});
  const menu=desktop.locator("[data-test-desktop-menu]");
  const view=menu.locator("[data-test-desktop-view]");
  await view.focus();
  await view.press("ArrowRight");
  const child=desktop.locator('[data-test-desktop-background-submenu]');
  const radio=child.getByRole("menuitemradio",{name:/Large icons/});
  await expect(radio).toBeFocused();
  await radio.press("ArrowDown");
  await expect(child.getByRole("menuitemradio",{name:/Medium icons/})).toBeFocused();
  await child.getByRole("menuitemradio",{name:/Medium icons/}).press("ArrowLeft");
  await expect(child).toHaveCount(0);
  await expect(view).toBeFocused();
  await page.keyboard.press("Escape");
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const explorer=page.locator('[data-test-window="computer"]');
  const content=explorer.locator(".explorer-content");
  const bounds=await content.boundingBox();
  if(!bounds)throw Error("Missing Explorer workspace");
  await content.click({button:"right",position:{x:Math.max(10,bounds.width-12),y:Math.max(10,bounds.height-12)}});
  const actions=explorer.locator('[data-test-explorer-context="background"]');
  const newer=actions.locator("[data-test-explorer-context-new]");
  await newer.focus();
  await newer.press("ArrowRight");
  const folder=actions.locator('[data-test-explorer-context-new-kind="folder"]');
  await expect(folder).toBeFocused();
  await folder.press("ArrowDown");
  await expect(actions.locator('[data-test-explorer-context-new-kind="richtext"]'))
    .toBeFocused();
  await actions.locator('[data-test-explorer-context-new-kind="richtext"]')
    .press("ArrowLeft");
  await expect(actions.locator('[data-test-explorer-context-new-kind]')).toHaveCount(0);
  await expect(newer).toBeFocused();
});
