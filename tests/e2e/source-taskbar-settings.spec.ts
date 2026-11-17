import {expect,test,type Page} from "@playwright/test";
async function guest(page:Page,theme:"win7"|"win11"="win7"){
  await page.goto("/?theme="+theme);
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
}
async function openProperties(page:Page){
  // The Win7 Start orb covers taskbar x=12; the shell correctly ignores
  // background-menu requests originating on that button. Right-click the
  // empty running-app lane, as in the existing source context regression.
  await page.locator(".windows-taskbar__running").click({
    button:"right",position:{x:15,y:5}
  });
  const menu=page.locator('[data-test-taskbar-context="background"]');
  await expect(menu).toBeVisible();
  const action=menu.locator('[data-test-taskbar-context-action="properties"]');
  await expect(action).toBeEnabled();
  await action.click();
  const app=page.locator('[data-test-window="taskbar"]');
  await expect(app).toBeVisible();
  return app;
}
test("source taskbar Properties supports three tabs, Start power and recent privacy",async({page})=>{
  await guest(page);
  const win=await openProperties(page);
  const tabs=win.getByRole("tablist",{name:"Taskbar and Start Menu Properties"});
  await expect(tabs.getByRole("tab")).toHaveText(["Taskbar","Start Menu","Toolbars"]);
  const start=tabs.getByRole("tab",{name:"Start Menu"});
  await start.click();
  const prefs=win.locator('[data-test-taskbar-settings-panel="start"]');
  await expect(prefs).toBeVisible();
  const action=prefs.locator("[data-test-taskbar-settings-power]");
  await expect(action).toHaveValue("shutdown");
  await action.selectOption("restart");
  await prefs.locator("[data-test-taskbar-settings-recent]").uncheck();
  await win.locator("[data-test-taskbar-settings-apply]").click();
  await expect(win.locator("[data-test-taskbar-settings-apply]")).toBeDisabled();
  await page.getByRole("button",{name:"Open Start menu"}).click();
  const power=page.locator('[data-test-startmenu-power-action="restart"]');
  await expect(power).toHaveText("Restart");
  await page.keyboard.press("Escape");
  await win.getByRole("tab",{name:"Start Menu"}).click();
  await expect(action).toHaveValue("restart");
  await win.locator("[data-test-taskbar-settings-ok]").click();
  await expect(win).toHaveCount(0);
  await page.reload();
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.getByRole("button",{name:"Open Start menu"}).click();
  await expect(page.locator('[data-test-startmenu-power-action="restart"]')).toBeVisible();
});
test("source Taskbar tab opens actual notification-area customization",async({page})=>{
  await guest(page,"win11");
  const taskbar=await openProperties(page);
  const panel=taskbar.locator('[data-test-taskbar-settings-panel="taskbar"]');
  await expect(panel.getByText("Taskbar appearance")).toBeVisible();
  await taskbar.locator('[data-test-taskbar-settings-customize]').click();
  const cpanel=page.locator('[data-test-window="cpanel"]');
  await expect(cpanel.locator("[data-test-cpanel-notification]")).toBeVisible();
});
test("source Taskbar Start Cancel discards draft and Toolbars remain source-disabled",async({page})=>{
  await guest(page);
  const win=await openProperties(page);
  await win.getByRole("tab",{name:"Start Menu"}).click();
  await win.locator("[data-test-taskbar-settings-power]").selectOption("logoff");
  await win.getByRole("button",{name:"Cancel"}).click();
  await expect(win).toHaveCount(0);
  await page.getByRole("button",{name:"Open Start menu"}).click();
  await expect(page.locator('[data-test-startmenu-power-action="shutdown"]')).toHaveText("Shut down");
  await page.keyboard.press("Escape");
  const next=await openProperties(page);
  await next.getByRole("tab",{name:"Toolbars"}).click();
  const tools=next.locator('[data-test-taskbar-settings-panel="toolbars"]');
  await expect(tools.locator('input[type="checkbox"]')).toHaveCount(4);
  await expect(tools.locator('input[type="checkbox"]:enabled')).toHaveCount(0);
});
