import {expect,test,type Page} from "@playwright/test";

/** legacy-win7 final source @26b9f0c: global maxWindowsPerApp=3.
 * Reopening a fourth Computer must display source error, focus an
 * existing window and preserve all mounted Guest Explorer sessions.
 */
async function guest(page:Page){
  await page.goto("/?theme=win7");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
}
test("final source limits Computer to three windows and recovers after close",async({page})=>{
  await guest(page);
  const computer=page.locator('[data-test-desktop-icon="computer"]');
  const windows=page.locator('[data-test-window="computer"]');
  for(let index=1;index<=3;index++){
    await computer.dblclick();
    await expect(windows).toHaveCount(index);
  }
  await computer.dblclick();
  const alert=page.locator('[data-test-window-limit-alert]');
  await expect(alert).toBeVisible();
  await expect(alert.getByRole("alertdialog")).toContainText(
    "You have already opened too many windows");
  await expect(windows).toHaveCount(3);
  await alert.getByRole("button",{name:"OK"}).click();
  await expect(alert).toHaveCount(0);
  await expect(windows).toHaveCount(3);
  await windows.first().getByRole("button",{name:"Close Computer"}).click();
  await expect(windows).toHaveCount(2);
  await computer.dblclick();
  await expect(windows).toHaveCount(3);
});
