import {expect,test,type Locator,type Page} from "@playwright/test";

/**
 * Original legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776
 * winui-menu keyboard affordances, migrated to the actual portaled
 * shared Start program menu. The originating program is rendered in
 * different layouts and has different test attributes by theme.
 */
async function openThemeProgram(page:Page,theme:string):Promise<Locator>{
  await page.goto("/?theme="+theme);
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.locator("[data-test-start-button]").click();
  const start=page.locator("[data-test-start-menu]");
  await expect(start).toHaveAttribute("data-source-start-theme",theme);
  if(theme==="win31"){
    await start.locator('[data-test-win31-group="simu-programs"]').click();
    return start.locator(
      '[data-test-win31-group-window="simu-programs"] [data-test-win31-program="notepad"]'
    );
  }
  if(theme==="win95"||theme==="win98"||theme==="win2k"){
    await start.locator('[data-test-win9x-branch="programs"]').click();
    return start.locator('[data-test-win9x-submenu="programs"] [data-test-win9x-program="notepad"]');
  }
  if(theme==="win8"||theme==="win81"){
    return start.locator('[data-test-win8-start-group-kind="programs"] [data-test-program="notepad"]');
  }
  return start.locator('[data-test-program="notepad"]');
}

for(const theme of [
  "win7","winxp","winvista","win10","win11dark",
  "win8","win81","win31","win95","win98","win2k"
] as const){
  test("portaled Start context roves arrows and Escape returns to exact trigger: "+theme,async({page})=>{
    const origin=await openThemeProgram(page,theme);
    await expect(origin).toBeVisible();
    await origin.click({button:"right"});

    const popup=page.locator('body > [data-test-start-program-context="notepad"]');
    await expect(popup).toHaveAttribute("data-source-start-context-theme",theme);
    const open=popup.locator('[data-test-start-context-action="open"]');
    const pin=popup.locator('[data-test-start-context-action="pin"]');
    const desktop=popup.locator('[data-test-start-context-action="send-desktop"]');
    const disabled=popup.locator('[data-test-start-context-action="properties"]');

    // A menu with its focus still on the originating tile cannot receive
    // its own ArrowUp/Down events. Initial focus must enter the portal.
    await expect(open).toBeFocused();
    await expect(disabled).toBeDisabled();
    await page.keyboard.press("ArrowDown");
    await expect(pin).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(desktop).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(open).toBeFocused(); // Disabled Properties is skipped.
    await page.keyboard.press("ArrowUp");
    await expect(desktop).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(popup).toHaveCount(0);
    await expect(origin).toBeFocused();
    await expect(page.locator("[data-test-start-menu]")).toBeVisible();
  });
}
