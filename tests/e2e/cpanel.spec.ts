import {expect,test,type Page} from "@playwright/test";

async function openControlPanel(page:Page){
  await page.goto("/");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.getByRole("button",{name:"Open Start menu"}).click();
  await page.locator('[data-test-open-cpanel]').click();
  const panel=page.locator('[data-test-window="cpanel"]');
  await expect(panel).toBeVisible();
  return panel;
}

test("original Control Panel Display navigation uses actual pinned artwork and Back/Forward history",async({page})=>{
  const win=await openControlPanel(page);
  const panel=win.locator("[data-test-cpanel]");
  await expect(panel.locator("[data-test-cpanel-items]")).toBeVisible();
  await expect(win.locator(".windows-window__titlebar img"))
    .toHaveAttribute("src",/cpanel\.38ffbb1d\.webp/);
  await panel.locator('[data-test-cpanel-item="display"]').click();
  const display=panel.locator("[data-test-cpanel-display]");
  await expect(display).toBeVisible();
  await expect(display.locator(".windows-cpanel__display-preview img"))
    .toHaveAttribute("src",/resolution\.f3fc8376\.webp/);
  await expect(display.locator("fieldset")).toBeDisabled();
  await expect(display.getByLabel("Resolution")).toBeDisabled();
  await expect(display.getByLabel("Zoom")).toBeDisabled();
  await expect(display.getByRole("option",{name:/Fullscreen/})).toHaveCount(1);
  await panel.locator("[data-test-cpanel-back]").click();
  await expect(panel.locator("[data-test-cpanel-items]")).toBeVisible();
  await panel.locator("[data-test-cpanel-forward]").click();
  await expect(display).toBeVisible();
  await display.getByRole("button",{name:"Cancel"}).click();
  await expect(win).toHaveCount(0);
});

test("source Control Panel search returns the Display task and rejects unknown locations",async({page})=>{
  const win=await openControlPanel(page);
  const panel=win.locator("[data-test-cpanel]");
  await panel.getByRole("searchbox",{name:"Search Control Panel"}).fill("resolution");
  const result=panel.locator('[data-test-cpanel-result="display"]');
  await expect(result).toBeVisible();
  await result.locator("[data-test-cpanel-task]").click();
  await expect(panel.locator("[data-test-cpanel-display]")).toBeVisible();
  await panel.getByRole("searchbox",{name:"Search Control Panel"}).fill("unavailable-widget");
  await expect(panel.locator("[data-test-cpanel-results]"))
    .toContainText("No items match your search.");
  await expect(panel.locator("[data-test-cpanel-item='unavailable-widget']")).toHaveCount(0);
});


test("source Control Panel Programs lists real simulated packages and supports selection/history",async({page})=>{
  const win=await openControlPanel(page);
  const panel=win.locator("[data-test-cpanel]");
  await panel.locator('[data-test-cpanel-item="programs"]').click();
  const programs=panel.locator("[data-test-cpanel-programs]");
  await expect(programs).toBeVisible();
  const notepad=programs.locator('[data-test-cpanel-program="notepad"]');
  await expect(notepad).toBeVisible();
  await expect(programs.locator('[data-test-cpanel-program="cpanel"]')).toHaveCount(0);
  await notepad.getByRole("button",{name:"Notepad"}).click();
  await expect(notepad).toHaveAttribute("aria-selected","true");
  await expect(programs.getByRole("button",{name:"Organize"})).toBeDisabled();
  await panel.locator("[data-test-cpanel-back]").click();
  await expect(panel.locator("[data-test-cpanel-items]")).toBeVisible();
  await panel.locator("[data-test-cpanel-forward]").click();
  await expect(programs).toBeVisible();
  await panel.getByRole("searchbox",{name:"Search Control Panel"}).fill("uninstall");
  await expect(panel.locator('[data-test-cpanel-result="programs"]')).toBeVisible();
});


test("source Control Panel Guest account page disables sign-in edits and switches users safely",async({page})=>{
  const win=await openControlPanel(page);
  const panel=win.locator("[data-test-cpanel]");
  await panel.locator('[data-test-cpanel-item="accounts"]').click();
  const accounts=panel.locator("[data-test-cpanel-accounts]");
  await expect(accounts).toBeVisible();
  await expect(accounts.locator("[data-test-cpanel-guest-account]"))
    .toContainText("Guest account");
  for(const action of ["password","picture","name","link","delete","others"]){
    await expect(accounts.locator('[data-test-account-action="'+action+'"]')).toBeDisabled();
  }
  await accounts.locator('[data-test-account-action="logoff"]').click();
  await expect(page.locator("[data-test-logon-screen]")).toBeVisible();
  await page.locator('[data-test-avatar="win7"]').click();
  // Original source emits changeView({view:"Switch"}), not LOG_OFF.
  // The live Guest Control Panel window survives the switch.
  await expect(win).toBeVisible();
});
