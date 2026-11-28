import {expect,test,type Page} from "@playwright/test";
import {openTaskbarBackgroundContext} from "./taskbarBackground";

async function guest(page:Page,theme:"win7"|"win11"){
  await page.goto("/?theme="+theme);
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
}
async function taskbarProperties(page:Page){
  await openTaskbarBackgroundContext(page);
  await page.locator('[data-test-taskbar-context-action="properties"]').click();
  const win=page.locator('[data-test-window="taskbar"]');
  await expect(win).toBeVisible();
  return win;
}
for(const theme of ["win7","win11"] as const){
  test("source "+theme+" taskbar non-combine labels apply live, Cancel and survive Guest reload",async({page})=>{
    await guest(page,theme);
    const settings=await taskbarProperties(page);
    const selector=settings.locator('[data-test-taskbar-settings-buttons]');
    const taskbar=page.locator('[data-test-taskbar="base"]');
    await expect(selector).toHaveValue("combine");
    await expect(taskbar).toHaveAttribute("data-taskbar-button-type","combine");
    await selector.selectOption("no-combine");
    await expect(taskbar).toHaveAttribute("data-taskbar-button-type","combine");
    await settings.locator('[data-test-taskbar-settings-apply]').click();
    await expect(taskbar).toHaveAttribute("data-taskbar-button-type","no-combine");
    await expect(settings.locator('[data-test-taskbar-settings-apply]')).toBeDisabled();
    await page.locator('[data-test-desktop-icon="computer"]').dblclick();
    const button=taskbar.locator('button.windows-taskbar__application[title="Computer"]');
    await expect(button).toBeVisible();
    await expect(button).toHaveClass(/is-full-size/);
    await expect(button.locator(".windows-taskbar__item-label")).toHaveText("Computer");
    await selector.selectOption("combine");
    await settings.getByRole("button",{name:"Cancel"}).click();
    await expect(taskbar).toHaveAttribute("data-taskbar-button-type","no-combine");
    await expect(button.locator(".windows-taskbar__item-label")).toHaveText("Computer");

    await page.reload();
    await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
    const taskbarReloaded=page.locator('[data-test-taskbar="base"]');
    await expect(taskbarReloaded).toHaveAttribute("data-taskbar-button-type","no-combine");
    await page.locator('[data-test-desktop-icon="computer"]').dblclick();
    await expect(taskbarReloaded.locator('button.windows-taskbar__application[title="Computer"] .windows-taskbar__item-label'))
      .toHaveText("Computer");
  });
  test("source "+theme+" combine-when-full also uses the original full-size label contract",async({page})=>{
    await guest(page,theme);
    const settings=await taskbarProperties(page);
    const selection=settings.locator('[data-test-taskbar-settings-buttons]');
    await selection.selectOption("combine-when-full");
    await settings.locator('[data-test-taskbar-settings-apply]').click();
    await page.locator('[data-test-desktop-icon="computer"]').dblclick();
    const button=page.locator('button.windows-taskbar__application[title="Computer"]');
    await expect(page.locator('[data-test-taskbar="base"]'))
      .toHaveAttribute("data-taskbar-button-type","combine-when-full");
    await expect(button.locator(".windows-taskbar__item-label")).toHaveText("Computer");
    await selection.selectOption("combine");
    await settings.locator('[data-test-taskbar-settings-apply]').click();
    await expect(button).not.toHaveClass(/is-full-size/);
    await expect(button.locator(".windows-taskbar__item-label")).toHaveCount(0);
  });
}
