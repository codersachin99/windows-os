import {expect,test,type Page} from "@playwright/test";

async function guestTheme(page:Page,theme:"win7"|"winxp"|"win11"){
  await page.goto("/?theme="+theme);
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  const shell=page.locator('[data-test-main-screen]');
  await expect(shell).toHaveAttribute("data-theme",theme);
  return shell;
}
test("source WinXP blue shell tokens reach taskbar, window chrome and Start",async({page})=>{
  const shell=await guestTheme(page,"winxp");
  const taskbar=shell.locator(".windows-taskbar");
  await expect(taskbar).toHaveCSS("background-color","rgb(34, 87, 213)");
  await expect(taskbar).toHaveCSS("backdrop-filter","none");
  await shell.locator('[data-test-desktop-icon="computer"]').dblclick();
  const win=shell.locator('[data-test-window="computer"]');
  await expect(win).toHaveCSS("background-color","rgb(122, 150, 223)");
  await expect(win).toHaveCSS("border-top-color","rgb(0, 85, 230)");
  await page.getByRole("button",{name:"Open Start menu"}).click();
  const start=shell.locator('[data-test-start-menu]');
  await expect(start).toHaveClass(/windows-startmenu--winxp/);
  await expect(start).toHaveCSS("border-top-color","rgb(22, 101, 203)");
});
test("source Win11 has 48px pale centered taskbar, 40px app cells and light window",async({page})=>{
  const shell=await guestTheme(page,"win11");
  const taskbar=shell.locator(".windows-taskbar");
  await expect(taskbar).toHaveCSS("height","48px");
  await expect(taskbar).toHaveCSS("background-color","rgb(240, 240, 240)");
  await expect(taskbar).toHaveCSS("justify-content","center");
  await shell.locator('[data-test-desktop-icon="computer"]').dblclick();
  const win=shell.locator('[data-test-window="computer"]');
  await expect(win).toHaveCSS("background-color","rgb(240, 240, 240)");
  const app=taskbar.locator(".windows-taskbar__application").first();
  await expect(app).toHaveCSS("width","40px");
  await expect(app).toHaveCSS("height","40px");
  await page.getByRole("button",{name:"Open Start menu"}).click();
  const start=shell.locator('[data-test-start-menu]');
  await expect(start).toHaveClass(/windows-startmenu--win11/);
  const box=await start.boundingBox();
  expect(box).not.toBeNull();
  expect(Math.abs(box!.x+box!.width/2-(await page.evaluate(()=>innerWidth/2))))
    .toBeLessThanOrEqual(2);
});
test("new theme skin imports do not contaminate the original Win7 shell",async({page})=>{
  const shell=await guestTheme(page,"win7");
  await expect(shell.locator(".windows-taskbar")).toHaveCSS("height","40px");
  await expect(shell.locator(".windows-taskbar")).toHaveCSS("justify-content","normal");
  await page.getByRole("button",{name:"Open Start menu"}).click();
  const start=shell.locator('[data-test-start-menu]');
  await expect(start).not.toHaveClass(/windows-startmenu--winxp|windows-startmenu--win11/);
});
