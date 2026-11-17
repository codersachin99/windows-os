import {expect,test,type Page} from "@playwright/test";
async function boot(page:Page){
  await page.goto("/?theme=win11");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.locator("[data-test-start-button]").click();
}
test("Win11 Start original footer shows source app actions and three power choices",async({page})=>{
  await boot(page);
  const start=page.locator("[data-test-start-menu]");
  const actions=start.locator("[data-test-win11-start-actions]");
  await expect(actions).toBeVisible();
  await expect(actions.getByRole("button",{name:"Open Computer"})).toBeVisible();
  await expect(actions.getByRole("button",{name:"Open Games"})).toBeVisible();
  await expect(actions.getByRole("button",{name:"Open Control Panel"})).toBeVisible();
  const power=actions.getByRole("button",{name:"Power Options"});
  await power.click();
  await expect(power).toHaveAttribute("aria-expanded","true");
  const menu=actions.locator("[data-test-win11-start-power-menu]");
  await expect(menu.locator("[role=menuitem]"))
    .toHaveText(["Log off","Shut down","Restart"]);
  await page.keyboard.press("Escape");
  await expect(menu).toHaveCount(0);
  await expect(start).toBeVisible();
  await power.click();
  await start.locator('[data-test-program="calc"]').click();
  await expect(menu).toHaveCount(0);
  await expect(page.locator('[data-test-window="calc"]')).toBeVisible();
});
test("Win11 Start Power Options Shut down dispatches actual shell power",async({page})=>{
  await boot(page);
  await page.locator("[data-test-win11-start-power-toggle]").click();
  await page.locator('[data-test-win11-start-power="shutdown"]').click();
  await expect(page.locator(".windows-shutdown")).toBeVisible();
});
test("Win11 Start footer Computer launches real Explorer",async({page})=>{
  await boot(page);
  await page.locator("[data-test-win11-start-computer]").click();
  await expect(page.locator('[data-test-window="computer"]')).toBeVisible();
});
