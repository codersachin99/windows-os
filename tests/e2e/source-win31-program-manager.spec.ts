import {expect,test,type Page} from "@playwright/test";

async function openProgramManager(page:Page){
  await page.goto("/?theme=win31");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await expect(page.locator('[data-test-main-screen]')).toHaveAttribute("data-theme","win31");
  await page.getByRole("button",{name:"Open Start menu"}).click();
  const manager=page.locator('[data-test-win31-program-manager]');
  await expect(manager).toBeVisible();
  return manager;
}

test("original Windows 3.1 Start is a centered 600x400 Program Manager, not Win7 Start",async({page})=>{
  const manager=await openProgramManager(page);
  await expect(manager).toHaveAttribute("data-source-start-theme","win31");
  await expect(manager.getByText("Program Manager",{exact:true})).toBeVisible();
  await expect(manager.locator('[data-test-win31-group]')).toHaveCount(3);
  await expect(manager.locator('[data-test-win31-group="recently-opened"]')).toBeVisible();
  await expect(manager.locator('[data-test-win31-group="simu-programs"]')).toBeVisible();
  await expect(manager.locator('[data-test-win31-group="games"]')).toBeVisible();
  await expect(manager).toHaveCSS("border-top-style","solid");
  const box=await manager.boundingBox(),viewport=page.viewportSize();
  expect(box).not.toBeNull();
  expect(viewport).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(-1);
  expect(box!.y).toBeGreaterThanOrEqual(-1);
  expect(box!.x+box!.width).toBeLessThanOrEqual(viewport!.width+1);
  expect(box!.y+box!.height).toBeLessThanOrEqual(viewport!.height+1);
  if(viewport!.width>=600&&viewport!.height>=450){
    expect(Math.round(box!.width)).toBe(600);
    expect(Math.round(box!.height)).toBe(400);
    // The original window-main has centered:true; the Program Manager
    // is centered inside the desktop area above its 40px taskbar.
    const expectedX=(viewport!.width-box!.width)/2;
    const expectedY=(viewport!.height-40-box!.height)/2;
    expect(Math.abs(box!.x-expectedX)).toBeLessThanOrEqual(2);
    expect(Math.abs(box!.y-expectedY)).toBeLessThanOrEqual(2);
  }
  const button=manager.locator('[data-test-win31-group="simu-programs"]');
  await button.hover();
  await expect(button.locator(".source-win31-program-manager__group-label"))
    .toHaveCSS("background-color","rgb(41, 0, 173)");
  await manager.locator('[data-test-win31-manager-maximize]').click();
  await expect(manager).toHaveClass(/is-maximized/);
  await manager.locator('[data-test-win31-manager-maximize]').click();
  await expect(manager).not.toHaveClass(/is-maximized/);
});

test("Win31 source Program Manager groups open, reorder and launch real registered applications",async({page})=>{
  const manager=await openProgramManager(page);
  const windows=manager.locator('[data-test-win31-group="simu-programs"]');
  await windows.click();
  const programGroup=manager.locator('[data-test-win31-group-window="simu-programs"]');
  await expect(programGroup).toBeVisible();
  await expect(programGroup.locator('[data-test-win31-program="calc"]')).toBeVisible();
  await expect(programGroup.locator('[data-test-win31-program="notepad"]')).toBeVisible();
  await manager.locator('[data-test-win31-group="games"]').click();
  const gameGroup=manager.locator('[data-test-win31-group-window="games"]');
  await expect(gameGroup).toBeVisible();
  await expect(gameGroup.locator('[data-test-win31-program="minesweeper"]')).toBeVisible();
  await gameGroup.locator('[data-test-win31-group-maximize="games"]').click();
  await expect(gameGroup).toHaveClass(/is-maximized/);
  await gameGroup.locator('[data-test-win31-group-close="games"]').click();
  await expect(gameGroup).toHaveCount(0);
  await expect(programGroup).toBeVisible();
  await programGroup.locator('[data-test-win31-program="calc"]').click();
  await expect(page.locator('[data-test-window="calc"]')).toBeVisible();
  await expect(manager).toHaveCount(0);
});

test("original Win31 Program Manager Window menu opens Computer and honors Guest power actions",async({page})=>{
  const manager=await openProgramManager(page);
  await manager.locator('[data-test-win31-menu="window"]').click();
  const menu=manager.locator('[data-test-win31-menu-open="window"]');
  await expect(menu.getByRole("menuitem",{name:"Computer"})).toBeVisible();
  await expect(menu.getByRole("menuitem",{name:"Control Panel"})).toBeVisible();
  await expect(menu.getByRole("menuitem",{name:"Restart"})).toBeVisible();
  await menu.getByRole("menuitem",{name:"Computer"}).click();
  await expect(page.locator('[data-test-window="computer"]')).toBeVisible();
  await page.getByRole("button",{name:"Open Start menu"}).click();
  const next=page.locator('[data-test-win31-program-manager]');
  await next.locator('[data-test-win31-menu="window"]').click();
  await next.getByRole("menuitem",{name:"Log off"}).click();
  await expect(page.locator('[data-test-logon-screen]')).toBeVisible();
  await expect(page.locator('[data-test-main-screen]')).toHaveCount(0);
});
