import {expect,test,type Page} from "@playwright/test";

const HOME="/EXTERNAL/computer/drive0/Users/Guest";

/**
 * Frozen legacy-win7 src/modules/shell/startmenu-base.js shortcuts():
 * Documents / Pictures / Music call open("computer", userPath + "/<folder>")
 * rather than opening the generic Computer root or a host path.
 */
async function login(page:Page,theme:string){
  await page.goto("/?theme="+theme);
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await expect(page.locator("#desktop-icons")).toBeVisible();
}
for(const theme of ["win7","winvista","basic-1"] as const){
  test("source "+theme+" right Start links open each Guest user library in Computer",async({page})=>{
    await login(page,theme);
    for(const folder of ["Documents","Pictures","Music"] as const){
      await page.getByRole("button",{name:"Open Start menu"}).click();
      const menu=page.locator("[data-test-start-menu]");
      await expect(menu).toBeVisible();
      const link=menu.locator('[data-test-startmenu-link="'+folder.toLowerCase()+'"]');
      await expect(link).toBeVisible();
      await expect(link).toHaveText(folder);
      await link.click();
      const computer=page.locator('[data-test-window="computer"]').last();
      await expect(computer).toBeVisible();
      await expect(computer.getByRole("textbox",{name:"Folder address"}))
        .toHaveValue(HOME+"/"+folder);
      // Close the actual Explorer before opening the next library; this also
      // ensures the next assertion isn't accidentally satisfied by an old
      // Computer window left at the desired path.
      await computer.getByRole("button",{name:/^Close /}).click();
      await expect(computer).toHaveCount(0);
    }
  });
}
test("Win10 rail Documents retains its separately sourced Computer action",async({page})=>{
  await login(page,"win10");
  await page.getByRole("button",{name:"Open Start menu"}).click();
  const menu=page.locator("[data-test-start-menu]");
  await expect(menu).toBeVisible();
  await expect(menu.locator('[data-test-startmenu-link="documents"]')).toHaveCount(0);
  await menu.getByRole("button",{name:"Open Documents"}).click();
  await expect(page.locator('[data-test-window="computer"]').last()).toBeVisible();
});
