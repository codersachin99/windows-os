import {expect,test,type Page} from "@playwright/test";

async function win31Desktop(page:Page){
  await page.goto("/?theme=win31");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  const desktop=page.locator('[data-test-main-screen][data-theme="win31"]');
  await expect(desktop).toBeVisible();
  return desktop;
}

test("original Win31 taskbar is flat white with dark classic app buttons",async({page})=>{
  const desktop=await win31Desktop(page);
  const taskbar=desktop.locator('[data-test-taskbar="base"]');
  await expect(taskbar).toHaveCSS("background-color","rgb(255, 255, 255)");
  await expect(taskbar).toHaveCSS("backdrop-filter","none");
  await expect(taskbar).toHaveCSS("border-top-color","rgb(0, 0, 0)");
  const start=taskbar.locator('[data-test-start-button]');
  await expect(start).toHaveCSS("border-radius","0px");
  await start.click();
  await expect(page.locator('[data-test-win31-program-manager]')).toBeVisible();
  await page.locator('[data-test-win31-manager-close]').click();
  await expect(page.locator('[data-test-win31-program-manager]')).toHaveCount(0);
  await expect(taskbar.locator(".windows-taskbar__clock")).toHaveCSS("color","rgb(0, 0, 0)");
});

test("Win31 desktop selects label only, opens authentic Computer and Recycle Bin windows",async({page})=>{
  const desktop=await win31Desktop(page);
  const computer=desktop.locator('[data-test-desktop-icon="computer"]');
  await expect(computer).toBeVisible();
  await computer.click();
  await expect(computer).toHaveCSS("background-color","rgba(0, 0, 0, 0)");
  await expect(computer.locator(".desktop__icon-name")).toHaveCSS("background-color","rgb(8, 10, 189)");
  await expect(computer.locator(".desktop__icon-name")).toHaveCSS("color","rgb(255, 255, 255)");
  await computer.dblclick();
  const explorer=desktop.locator('[data-test-window="computer"]');
  await expect(explorer).toBeVisible();
  await expect(explorer).toHaveCSS("border-top-color","rgb(0, 0, 0)");
  await expect(explorer).toHaveCSS("border-top-left-radius","0px");
  const titlebar=explorer.locator(".windows-window__titlebar");
  await expect(titlebar).toHaveCSS("height","24px");
  await expect(titlebar).toHaveCSS("background-color","rgb(8, 10, 189)");
  await expect(titlebar.locator(":scope > img")).toHaveCSS("display","none");
  await expect(explorer.locator('[data-source-window-control="minimize"]'))
    .toHaveCSS("width","24px");
  await desktop.locator('[data-test-desktop-icon="bin"]').dblclick();
  await expect(desktop.locator('[data-test-window="bin"]')).toBeVisible();
  await expect(desktop.locator('[data-test-window="bin"]'))
    .toHaveCSS("border-top-color","rgb(0, 0, 0)");
});

test("Win31 window minimize and restore remain operational with classic caption controls",async({page})=>{
  const desktop=await win31Desktop(page);
  await desktop.locator('[data-test-desktop-icon="computer"]').dblclick();
  const explorer=desktop.locator('[data-test-window="computer"]');
  await expect(explorer).toBeVisible();
  await explorer.locator('[data-source-window-control="minimize"]').click();
  await expect(explorer).toHaveCount(0);
  const taskbar=desktop.locator('[data-test-taskbar="base"]');
  const computerButton=taskbar.locator('button.windows-taskbar__application[title="Computer"]');
  await expect(computerButton).toBeVisible();
  await computerButton.click();
  await expect(explorer).toBeVisible();
  await expect(explorer.locator(".windows-window__titlebar"))
    .toHaveCSS("height","24px");
});
