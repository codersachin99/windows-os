import {expect,test,type Page} from "@playwright/test";

async function openControlPanel(page:Page){
  await page.goto("/");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.getByRole("button",{name:"Open Start menu"}).click();
  await page.locator("[data-test-open-cpanel]").click();
  const panel=page.locator('[data-test-window="cpanel"]');
  await expect(panel).toBeVisible();
  return panel;
}

test("original Control Panel theme task launches actual Personalize window",async({page})=>{
  const win=await openControlPanel(page);
  const panel=win.locator("[data-test-cpanel]");
  const input=panel.getByRole("searchbox",{name:"Search Control Panel"});
  await input.fill("change the theme");
  const result=panel.locator('[data-test-cpanel-result="personalize"]');
  await expect(result).toBeVisible();
  const themeTask=result.getByRole("button",{name:"Change the theme"});
  await expect(themeTask).toBeEnabled();
  await themeTask.click();
  const personalize=page.locator('[data-test-window="personalize"]');
  await expect(personalize).toBeVisible();
  // A program target opens its own window, not a fake CPanel history page.
  await expect(win).toBeVisible();
  await personalize.locator('[data-test-personalize-theme="winxp"]').click();
  await expect(page.locator("[data-test-main-screen]"))
    .toHaveAttribute("data-theme","winxp");
});

test("original Control Panel taskbar program opens its own settings window",async({page})=>{
  const win=await openControlPanel(page);
  const panel=win.locator("[data-test-cpanel]");
  await expect(panel.locator('[data-test-cpanel-item="defender"]')).toBeDisabled();
  await expect(panel.locator('[data-test-cpanel-item="gadgets"]')).toBeDisabled();
  const entry=panel.locator('[data-test-cpanel-item="taskbar"]');
  await expect(entry).toBeEnabled();
  await entry.click();
  const taskbar=page.locator('[data-test-window="taskbar"]');
  await expect(taskbar).toBeVisible();
  await expect(taskbar.getByRole("tablist",{name:"Taskbar and Start Menu Properties"})
    .getByRole("tab")).toHaveText(["Taskbar","Start Menu","Toolbars"]);
  await expect(win).toBeVisible();
});
