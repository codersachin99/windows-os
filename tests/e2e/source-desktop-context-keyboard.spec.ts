import {expect,test,type Page} from "@playwright/test";

/**
 * Source-locked legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776
 * DesktopMenu right-click and WinUI keyboard navigation.
 * Tests inspect the real Desktop and popup rather than a helper mock.
 */
async function guest(page:Page,theme:string){
  await page.goto("/?theme="+theme);
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await expect(page.locator("[data-test-main-screen]")).toHaveAttribute("data-theme",theme);
  const desktop=page.locator("#desktop-icons");
  await expect(desktop).toBeVisible();
  return desktop;
}

for(const theme of ["win7","winxp","win31","win8","win11dark"] as const){
  test("Desktop background menu focuses View, roves submenu and Escape restores Desktop: "+theme,async({page})=>{
    const desktop=await guest(page,theme);
    await desktop.click({button:"right",position:{x:260,y:200}});
    const menu=desktop.locator('[data-test-desktop-menu]');
    await expect(menu).toBeVisible();
    const view=menu.locator('[data-test-desktop-view]');
    const sort=menu.locator('[data-test-desktop-sort]');
    await expect(view).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(sort).toBeFocused();
    await page.keyboard.press("ArrowUp");
    await expect(view).toBeFocused();

    await page.keyboard.press("ArrowRight");
    const large=menu.getByRole("menuitemradio",{name:/Large icons/});
    await expect(large).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await expect(view).toBeFocused();
    await expect(view).toHaveAttribute("aria-expanded","false");

    await page.keyboard.press("Escape");
    await expect(menu).toHaveCount(0);
    await expect(desktop).toBeFocused();
    await expect(page.locator("[data-test-main-screen]")).toBeVisible();
  });

  test("Desktop Computer icon menu skips disabled Properties and Escape focuses icon: "+theme,async({page})=>{
    const desktop=await guest(page,theme);
    const computer=desktop.locator('[data-test-desktop-icon="computer"]');
    await expect(computer).toBeVisible();
    await computer.click({button:"right"});
    const menu=desktop.locator('[data-test-desktop-menu]');
    await expect(menu).toBeVisible();
    const open=menu.locator('[data-test-desktop-item-action="open"]');
    const pin=menu.locator('[data-test-desktop-item-action="pin"]');
    const properties=menu.locator('[data-test-desktop-item-action="properties"]');
    await expect(properties).toBeDisabled();
    await expect(open).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(pin).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(open).toBeFocused();
    await page.keyboard.press("ArrowUp");
    await expect(pin).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(menu).toHaveCount(0);
    await expect(computer).toBeFocused();
    await expect(page.locator("[data-test-window=\"computer\"]")).toHaveCount(0);
  });
}

test("Recycle Bin context skips unavailable Empty and Properties yet keeps functional Open",async({page})=>{
  const desktop=await guest(page,"win7");
  const bin=desktop.locator('[data-test-desktop-icon="bin"]');
  await bin.click({button:"right"});
  const menu=desktop.locator('[data-test-desktop-menu]');
  const open=menu.locator('[data-test-desktop-item-action="open"]');
  const empty=menu.locator('[data-test-desktop-item-action="empty-bin"]');
  const pin=menu.locator('[data-test-desktop-item-action="pin"]');
  const properties=menu.locator('[data-test-desktop-item-action="properties"]');
  await expect(empty).toBeDisabled();
  await expect(properties).toBeDisabled();
  await expect(open).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(pin).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(open).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator('[data-test-window="bin"]')).toBeVisible();
});
