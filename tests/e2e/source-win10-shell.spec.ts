import {expect,test} from "@playwright/test";

/**
 * Source lock: legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776.
 * Original icons.registry.json win10 group + theme-win10-scss.js.
 * The Win10 Start *menu* and full shell remain separate pending work.
 */
test("Win10 Desktop, Computer and Bin use byte-pinned original artwork and source shell styling",async({page})=>{
  await page.goto("/?theme=win10");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  const desktop=page.locator("[data-test-main-screen]");
  await expect(desktop).toHaveAttribute("data-theme","win10");
  const wallpaper=page.locator(".windows-desktop__wallpaper");
  await expect(wallpaper).toHaveAttribute(
    "data-test-desktop-background","/assets/images/win10.743e8c13.webp");
  await expect(wallpaper).toHaveCSS("background-image",/win10\.743e8c13\.webp/);
  const start=page.locator("[data-test-start-button]");
  await expect(start.locator("img")).toHaveAttribute("src",
    "/assets/images/start-button-win8.2e5214cc.svg");
  await expect(start.locator("img")).toHaveCSS("width","20px");
  const computer=page.locator('[data-test-desktop-icon="computer"]');
  const bin=page.locator('[data-test-desktop-icon="bin"]');
  await expect(computer.locator(".desktop__icon-icon")).toHaveAttribute(
    "src","/assets/images/computer-win10.2212df79.webp");
  await expect(bin.locator(".desktop__icon-icon")).toHaveAttribute(
    "src","/assets/images/bin-win10.e0f739cc.webp");
  const taskbar=page.locator('[data-test-taskbar="base"]');
  await expect(taskbar).toHaveCSS("background-color","rgb(16, 16, 16)");
  await expect(taskbar).toHaveCSS("backdrop-filter","none");
  await expect(page.locator('[data-test-show-desktop]')).toHaveCSS("width","5px");
  await computer.click();
  await expect(computer).toHaveClass(/is-active/);
  await expect(computer).toHaveCSS("background-color","rgba(57, 142, 211, 0.4)");
  await computer.dblclick();
  const win=page.locator('[data-test-window="computer"]');
  await expect(win).toBeVisible();
  await expect(win).toHaveAttribute("data-source-window-active","true");
  await expect(win).toHaveCSS("border-top-left-radius","0px");
  await expect(win).toHaveCSS("background-color","rgb(255, 255, 255)");
  const buttons=win.locator(".windows-window__buttons button");
  await expect(buttons).toHaveCount(3);
  const metrics=await buttons.evaluateAll(nodes=>nodes.map(n=>({
    width:n.getBoundingClientRect().width,
    height:n.getBoundingClientRect().height
  })));
  expect(metrics).toEqual([{width:44,height:28},{width:44,height:28},{width:44,height:28}]);
  const running=page.locator('[data-test-taskbar-pin="computer"],[data-test-taskbar-running-group="computer"]').first();
  await expect(running).toHaveClass(/is-active/);
  const close=win.getByRole("button",{name:"Close Computer"});
  await close.hover();
  await expect(close).toHaveCSS("background-color","rgb(232, 17, 35)");
  await close.click();
  await expect(win).toHaveCount(0);
  await start.click();
  await expect(page.locator("[data-test-start-menu]")).toBeVisible();
  // Start program icons now resolve through the original Win10 icon registry,
  // although the final Win10 sidebar/tile layout is still pending.
  await expect(page.locator('[data-test-program="cpanel"] img')).toHaveAttribute(
    "src","/assets/images/cpanel-win10.d3d1d446.webp");
  await expect(page.locator('[data-test-program="games"] img')).toHaveAttribute(
    "src","/assets/images/games-win10.63f82076.webp");
});
