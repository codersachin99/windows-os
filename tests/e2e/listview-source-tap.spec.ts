import {expect,test} from "@playwright/test";

test("source webpack 0616 v-tap:400 distinguishes a click from two rapid clicks",async({page})=>{
  await page.goto("/?theme=win7");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const win=page.locator('[data-test-window="computer"]');
  await expect(win).toBeVisible();
  await win.getByRole("button",{name:"New folder"}).click();
  const prompt=win.getByRole("dialog",{name:"New folder"});
  await prompt.getByRole("textbox",{name:"New folder name"}).fill("DoubleTapSource");
  await prompt.getByRole("button",{name:"OK"}).click();
  const entry=win.locator('[data-test-explorer-item="DoubleTapSource"]');
  await expect(entry).toBeVisible();
  await entry.click();
  await expect(entry).toHaveClass(/is-active/);
  await expect(win.getByRole("textbox",{name:"Folder address"})).toHaveValue("Computer");
  // Source clickHelper attaches in the click capture phase: two click events
  // within 400ms trigger one open action even without a native dblclick.
  await page.waitForTimeout(430);
  await entry.evaluate(node=>{
    (node as HTMLButtonElement).click();
    (node as HTMLButtonElement).click();
  });
  await expect(win.getByRole("textbox",{name:"Folder address"}))
    .toHaveValue("/DoubleTapSource");
});
