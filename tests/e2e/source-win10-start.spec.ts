import {expect,test} from "@playwright/test";

/** Source startmenu-win10.js (53e9) and startmenu-win10.css pinned final. */
test("Win10 Start uses source dark rail, program list, responsive tile surface and power actions",async({page},testInfo)=>{
  await page.goto("/?theme=win10");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.locator("[data-test-start-button]").click();
  const menu=page.locator("[data-test-start-menu]");
  await expect(menu).toHaveAttribute("data-source-start-theme","win10");
  await expect(menu).toHaveClass(/windows-startmenu--win10/);
  await expect(menu).toHaveCSS("background-color","rgb(31, 31, 31)");
  const sidebar=page.locator("[data-test-win10-start-sidebar]");
  await expect(sidebar).toBeVisible();
  await expect(sidebar).toHaveCSS("width","48px");
  await sidebar.hover();
  await expect(sidebar).toHaveCSS("width","200px");
  const settings=menu.locator("[data-test-win10-start-settings]");
  await expect(settings.locator("img")).toHaveAttribute("src",
    "/assets/images/cpanel-win10.d3d1d446.webp");
  await expect(menu.locator("[data-test-win10-start-documents] img")).toHaveAttribute(
    "src","/assets/images/computer-win10.2212df79.webp");
  const tiles=menu.locator("[data-test-win10-start-tiles]");
  if(testInfo.project.name==="chromium-mobile"){
    await expect(menu.locator(".windows-startmenu__right")).toBeHidden();
  }else{
    await expect(tiles).toBeVisible();
  }
  const power=menu.locator("[data-test-win10-start-power-toggle]");
  await power.click();
  await expect(power).toHaveAttribute("aria-expanded","true");
  const powerMenu=menu.locator("[data-test-win10-start-power-menu]");
  await expect(powerMenu.getByRole("menuitem")).toHaveCount(3);
  await expect(powerMenu.locator('[data-test-win10-start-power="restart"]')).toBeVisible();
  await power.press("Escape");
  await expect(powerMenu).toHaveCount(0);
  await settings.click();
  await expect(page.locator('[data-test-window="cpanel"]')).toBeVisible();
  await page.locator("[data-test-start-button]").click();
  await expect(page.locator("[data-test-win10-start-sidebar]")).toBeVisible();
  await page.locator("[data-test-win10-start-games]").click();
  await expect(page.locator('[data-test-window="games"]')).toBeVisible();
});

test("Win10 Start recent tiles are backed by opened apps and share program actions",async({page},testInfo)=>{
  await page.goto("/?theme=win10");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  await expect(page.locator('[data-test-window="computer"]')).toBeVisible();
  await page.locator("[data-test-start-button]").click();
  const menu=page.locator("[data-test-start-menu]");
  const tile=menu.locator('[data-test-win10-start-tile="computer"]');
  await expect(tile).toHaveCount(1);
  if(testInfo.project.name==="chromium-desktop"){
    await expect(tile).toBeVisible();
    await expect(tile.locator("img")).toHaveAttribute(
      "src","/assets/images/computer-win10.2212df79.webp");
    await tile.click({button:"right"});
    await expect(page.locator('[data-test-start-program-context="computer"]')).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator('[data-test-start-program-context="computer"]')).toHaveCount(0);
  }
  await menu.getByRole("button",{name:"Open Documents"}).click();
  // Original source Computer supports multiple independent windows.
  // Opening the Start shortcut must create/focus a new actual Guest window,
  // not silently convert the previous instance to a singleton.
  const windows=page.locator('[data-test-window="computer"]');
  await expect(windows).toHaveCount(2);
  await expect(windows.last()).toBeVisible();
  await expect(windows.last()).toHaveAttribute("data-source-window-active","true");
});
