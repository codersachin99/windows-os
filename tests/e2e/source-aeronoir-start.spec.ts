import {test,expect} from "@playwright/test";
test("Aero Noir base Start source paint and Guest library navigation",async({page})=>{
  await page.goto("/?theme=aeroNoir");
  await page.locator('[data-test-source-logon-avatar="aeroNoir"]').click({timeout:12000});
  const start=page.locator('[data-test-start-button]');
  const menu=page.locator('[data-test-start-menu][data-source-start-theme="aeroNoir"]');
  await start.click();
  await expect(menu).toBeVisible();
  await expect(menu).toHaveCSS("border-top-left-radius","6px");
  await expect(menu.locator(".windows-startmenu__left")).toHaveCSS("background-image",/linear-gradient\(rgb\(85, 85, 85\), rgb\(51, 51, 51\)\)/);
  await expect(menu.locator(".windows-startmenu__right")).toHaveCSS("padding-top","30px");
  await expect(menu.locator('[data-test-startmenu-power-action]')).toBeVisible();
  const box=await menu.boundingBox();
  expect(box).not.toBeNull();
  const viewport=page.viewportSize();
  if(box&&viewport){
    expect(box.width).toBeLessThanOrEqual(viewport.width);
    expect(box.height).toBeLessThanOrEqual(400);
    if(viewport.width>=414&&viewport.height>=445)expect(box.height).toBe(400);
  }
  await menu.locator('[data-test-all-programs]').click();
  await expect(menu).toHaveClass(/is-all-programs/);
  await menu.locator('[data-test-all-programs]').click();
  for(const folder of ["Documents","Pictures","Music"] as const){
    if(!await menu.isVisible())await start.click();
    await menu.locator('[data-test-startmenu-link="'+folder.toLowerCase()+'"]').click();
    const computer=page.locator('[data-test-window="computer"]').last();
    await expect(computer).toBeVisible();
    await expect(computer.getByRole("textbox",{name:"Folder address"})).toHaveValue("/EXTERNAL/computer/drive0/Users/Guest/"+folder);
    await computer.locator('[data-source-window-control="close"]').click();
    await expect(computer).toHaveCount(0);
  }
  if(!await menu.isVisible())await start.click();
  await menu.locator('[data-test-startmenu-search]').fill("Notepad");
  await menu.locator('[data-test-program="notepad"]').click();
  await expect(page.locator('[data-test-window="notepad"]')).toBeVisible();
});
