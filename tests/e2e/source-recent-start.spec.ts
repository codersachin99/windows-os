import {expect,test,type Page} from "@playwright/test";
async function login(page:Page,theme:"win7"|"winxp"|"win11"="win11"){
  await page.goto("/?theme="+theme);
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
}
async function launchFromStart(page:Page,id:string){
  await page.locator("[data-test-start-button]").click();
  const start=page.locator("[data-test-start-menu]");
  await expect(start).toBeVisible();
  await start.locator('[data-test-program="'+id+'"]').click();
  await expect(page.locator('[data-test-window="'+id+'"]')).toBeVisible();
}
test("source Win11 recently-opened list follows actual launches and persists",async({page})=>{
  await login(page,"win11");
  await page.locator("[data-test-start-button]").click();
  await expect(page.locator("[data-test-list-recent]")).toHaveCount(0);
  await page.keyboard.press("Escape");
  await launchFromStart(page,"calc");
  await launchFromStart(page,"notepad");
  await page.locator("[data-test-start-button]").click();
  const recent=page.locator("[data-test-list-recent]");
  await expect(recent.locator("[data-test-recent-program]").first()).toHaveAttribute(
    "data-test-recent-program","notepad");
});
test("source XP recent history restores without importing host programs",async({page})=>{
  await login(page,"winxp");
  await launchFromStart(page,"calc");
  await launchFromStart(page,"notepad");
  await page.reload();
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.locator("[data-test-start-button]").click();
  const recents=page.locator("[data-test-list-recent]");
  await expect(recents.locator("[data-test-recent-program]").first())
    .toHaveAttribute("data-test-recent-program","notepad");
  await expect(recents.locator('[data-test-recent-program="calc"]')).toBeVisible();
  await expect(recents.locator('[data-test-recent-program="notepad"]')).toBeVisible();
});


test("final Win7 Start lists recent Guest programs before All Programs and after reload",async({page})=>{
  await login(page,"win7");
  await page.locator("[data-test-start-button]").click();
  await expect(page.locator('[data-test-list-recent]')).toHaveCount(0);
  await page.keyboard.press("Escape");
  await launchFromStart(page,"calc");
  await launchFromStart(page,"notepad");
  await page.locator("[data-test-start-button]").click();
  const start=page.locator('[data-test-start-menu]');
  const recent=start.locator('[data-test-list-recent]');
  await expect(recent).toBeVisible();
  await expect(recent.locator('[data-test-recent-program]').first())
    .toHaveAttribute("data-test-recent-program","notepad");
  await expect(recent.locator('[data-test-recent-program="calc"]')).toBeVisible();
  await expect(start.locator('[data-test-program="notepad"]')).toBeVisible();
  await start.locator('[data-test-all-programs]').click();
  await expect(start.locator('[data-test-list-recent]')).toHaveCount(0);
  await page.reload();
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.locator("[data-test-start-button]").click();
  const restored=page.locator('[data-test-start-menu] [data-test-list-recent]');
  await expect(restored.locator('[data-test-recent-program]').first())
    .toHaveAttribute("data-test-recent-program","notepad");
  await restored.locator('[data-test-recent-program="calc"]').click();
  await expect(page.locator('[data-test-window="calc"]')).toBeVisible();
  await expect(page.locator('[data-test-start-menu]')).toHaveCount(0);
});


/**
 * The pinned startmenu-base.js has one recentPrograms list and configured
 * power action for Win7's shared Start renderer. Switching to an original
 * Aero or Basic skin must not silently remove either live command surface.
 * These exercise real launches on desktop AND mobile, not theme token values.
 */
for(const theme of [
  "aero-1","aero-2","aero-3","aero-4",
  "basic-1","basic-2","basic-3","basic-4"
] as const){
  test("source Win7 Aero and Basic Start recent and power: "+theme,async({page})=>{
    await page.goto("/?theme="+theme);
    await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
    const button=page.locator("[data-test-start-button]");
    await button.click();
    const menu=page.locator("[data-test-start-menu]");
    await expect(menu).toHaveAttribute("data-source-start-theme",theme);
    await expect(menu.locator("[data-test-startmenu-power-action]"))
      .toHaveText("Shut down");
    await expect(menu.locator("[data-test-list-recent]")).toHaveCount(0);
    await menu.locator('[data-test-program="notepad"]').click();
    await expect(page.locator('[data-test-window="notepad"]')).toBeVisible();
    await button.click();
    const recent=menu.locator("[data-test-list-recent]");
    await expect(recent.locator('[data-test-recent-program="notepad"]'))
      .toBeVisible();
    await menu.locator("[data-test-all-programs]").click();
    await expect(menu.locator("[data-test-list-recent]")).toHaveCount(0);
  });
}

for(const theme of ["aero-2","basic-3"] as const){
  test("source Win7 Start configured power button remains functional: "+theme,async({page})=>{
    await page.addInitScript(()=>{
      localStorage.setItem("windows-os:guest:start-preferences:v1",
        JSON.stringify({powerButtonAction:"switchuser",storeRecentApps:true}));
    });
    await page.goto("/?theme="+theme);
    await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
    await page.locator("[data-test-start-button]").click();
    const power=page.locator('[data-test-startmenu-power-action="switchuser"]');
    await expect(power).toBeVisible();
    await expect(power).toHaveText("Switch user");
    await power.click();
    await expect(page.locator("[data-test-logon-screen]")).toBeVisible();
    await expect(page.locator("[data-test-main-screen]")).toHaveCount(0);
  });
}
