import {expect,test,type Page} from "@playwright/test";
async function guest(page:Page,theme:"win7"|"win11"|"win10"="win7"){
  await page.goto("/?theme="+theme);
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
}
async function openProperties(page:Page){
  const bar=page.locator(".windows-taskbar");
  if(await bar.getAttribute("data-taskbar-centered")==="true"){
    await bar.click({button:"right",position:{x:12,y:10}});
  }else{
    // Both left-aligned Win7 and Win11 expose a blank running lane.
    await page.locator(".windows-taskbar__running").click({button:"right",position:{x:15,y:5}});
  }
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

test("source Win7 Aero Peek previews then restores windows without minimizing, while click minimizes",async({page})=>{
  await guest(page);
  const win=await openProperties(page);
  const setting=win.locator("[data-test-taskbar-settings-aero-peek]");
  await expect(setting).toBeEnabled();
  await expect(setting).not.toBeChecked();
  const desktop=page.locator("[data-test-main-screen]");
  const showDesktop=page.locator("[data-test-show-desktop]");
  await showDesktop.hover();
  await expect(desktop).not.toHaveAttribute("data-source-aero-peeking","true");
  await setting.check();
  await expect(win.locator("[data-test-taskbar-settings-apply]")).toBeEnabled();
  // Source taskbar property edits have transactional Apply/Cancel behavior.
  await expect(desktop).not.toHaveAttribute("data-source-aero-peeking","true");
  await win.locator("[data-test-taskbar-settings-apply]").click();
  await expect(win.locator("[data-test-taskbar-settings-apply]")).toBeDisabled();
  await showDesktop.hover();
  await expect(desktop).toHaveAttribute("data-source-aero-peeking","true");
  await expect(win.locator(".windows-window__body")).toHaveCSS("opacity","0");
  await expect(win).toBeVisible();
  await page.mouse.move(180,140);
  await expect(desktop).not.toHaveAttribute("data-source-aero-peeking","true");
  await expect(win.locator(".windows-window__body")).toHaveCSS("opacity","1");
  await showDesktop.click();
  await expect(desktop).not.toHaveAttribute("data-source-aero-peeking","true");
  await expect(win).toHaveCount(0);
  await page.reload();
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  const reopened=await openProperties(page);
  await expect(reopened.locator("[data-test-taskbar-settings-aero-peek]")).toBeChecked();
});

test("source Aero Peek Cancel drops draft and unsupported Win11 remains disabled",async({page})=>{
  await guest(page);
  let win=await openProperties(page);
  const setting=win.locator("[data-test-taskbar-settings-aero-peek]");
  await setting.check();
  await win.getByRole("button",{name:"Cancel"}).click();
  win=await openProperties(page);
  await expect(win.locator("[data-test-taskbar-settings-aero-peek]")).not.toBeChecked();
  await win.getByRole("button",{name:"Cancel"}).click();
  // Only Win7's original Aero Peek style and hit-testing bridge is migrated.
  await page.goto("/?theme=win11");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  const win11=await openProperties(page);
  await expect(win11.locator("[data-test-taskbar-settings-aero-peek]"))
    .toBeDisabled();
});

test("Win11 center setting is transactional, persistent and falls back when groups do not fit",async({page})=>{
  await page.setViewportSize({width:1280,height:800});
  await guest(page,"win11");
  const bar=page.locator(".windows-taskbar");
  await expect(bar).toHaveAttribute("data-taskbar-centered","false");
  let win=await openProperties(page);
  let center=win.locator("[data-test-taskbar-settings-centered]");
  await expect(center).toBeEnabled();await expect(center).not.toBeChecked();
  await center.check();await expect(bar).toHaveAttribute("data-taskbar-centered","false");
  await win.getByRole("button",{name:"Cancel"}).click();
  win=await openProperties(page);center=win.locator("[data-test-taskbar-settings-centered]");
  await expect(center).not.toBeChecked();await center.check();
  await win.locator("[data-test-taskbar-settings-apply]").click();
  await expect(bar).toHaveAttribute("data-taskbar-centered","true");
  await win.locator("[data-test-taskbar-settings-ok]").click();
  await page.reload();await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await expect(bar).toHaveAttribute("data-taskbar-centered","true");
  await page.setViewportSize({width:320,height:640});
  await expect(bar).toHaveAttribute("data-taskbar-centered","false");
  await page.setViewportSize({width:1280,height:800});
  await expect(bar).toHaveAttribute("data-taskbar-centered","true");
});

test("source Win10 taskbar search opens Start, shares query and launches a registered app",async({page})=>{
  await guest(page,"win10");
  const input=page.locator("[data-test-taskbar-search-input]");
  const menu=page.locator("[data-test-start-menu]");
  await expect(input).toBeVisible();
  await expect(input).toHaveAttribute("placeholder","Type here to search");
  await input.click();
  await expect(menu).toBeVisible();
  await input.fill("Notepad");
  await expect(menu.locator('[data-test-program="notepad"]')).toBeVisible();
  await input.press("Escape");
  await expect(menu).toHaveCount(0);
  await expect(input).toHaveValue("");
  await input.click();
  await input.fill("Notepad");
  await input.press("Enter");
  await expect(page.locator('[data-test-window="notepad"]')).toBeVisible();
  await expect(menu).toHaveCount(0);
  await expect(input).toHaveValue("");
  await guest(page,"win11");
  await expect(page.locator("[data-test-taskbar-search]")).toHaveCount(0);
});
