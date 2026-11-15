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
