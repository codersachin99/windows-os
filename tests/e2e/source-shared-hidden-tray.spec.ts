import {test,expect} from "@playwright/test";

for(const theme of ["chromeos","kubuntu","oxygen","aeroNoir","macos","ubuntu"] as const){
  test(theme+" notification preferences retain access to the real volume component",async({page})=>{
    await page.goto("/?theme="+theme);
    await page.locator('[data-test-source-logon-avatar="'+theme+'"]').click({timeout:12000});
    const tray=page.locator('[data-test-taskbar-tray="'+theme+'"]');
    await tray.locator("[data-test-action-center]").click();
    await tray.locator("[data-test-open-action-center]").click();
    const cpanel=page.locator('[data-test-window="cpanel"]').last();
    await expect(cpanel.locator("[data-test-cpanel-action-center]")).toBeVisible();
    // Original cpanel handleResize hides the side pane at <=500px.
    const action=cpanel.locator("[data-test-cpanel-action-center]");
    const sidebar=action.locator(".windows-cpanel__action-sidebar");
    const width=await action.evaluate(element=>element.clientWidth);
    if(width<=500)await expect(sidebar).toBeHidden();
    else await expect(sidebar).toBeVisible();
    await cpanel.getByRole("navigation",{name:"Control Panel location"}).getByRole("button",{name:"Control Panel",exact:true}).click();
    await cpanel.locator('[data-test-cpanel-item="notification"]').click();
    const settings=cpanel.locator("[data-test-cpanel-notification]");
    await expect(settings).toBeVisible();
    await settings.locator('[data-test-cpanel-notification-icon="TaskbarVolume"] select').selectOption("hidden");
    await settings.getByRole("button",{name:"OK",exact:true}).click();
    const toggle=tray.locator("[data-test-tray-hidden-toggle]");
    if(theme==="macos"||theme==="ubuntu"){
      // Original dedicated top bars have no base hidden-items popup.
      await expect(toggle).toHaveCount(0);
      await tray.locator("[data-test-volume]").click();
      await expect(tray.locator("[data-test-volume-popup]")).toBeVisible();
      return;
    }
    await expect(tray.locator("[data-test-volume]")).toHaveCount(0);
    await toggle.click();
    const hidden=tray.locator("[data-test-tray-hidden-items]");
    const volume=hidden.locator("[data-test-volume]");
    await volume.click();
    const mixer=hidden.locator("[data-test-volume-popup]");
    await expect(mixer).toBeVisible();
    await mixer.getByRole("slider").fill("42");
    await expect(mixer.getByRole("slider")).toHaveValue("42");
    const box=(await mixer.boundingBox())!,view=page.viewportSize()!;
    expect(box.x).toBeGreaterThanOrEqual(-2);
    expect(box.y).toBeGreaterThanOrEqual(-2);
    expect(box.x+box.width).toBeLessThanOrEqual(view.width+2);
    const parent=(await hidden.boundingBox())!;
    expect(box.y+box.height).toBeLessThanOrEqual(parent.y+2);
    await page.keyboard.press("Escape");
    await expect(mixer).toHaveCount(0);
    await expect(volume).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(hidden).toHaveCount(0);
    await expect(toggle).toBeFocused();
    await toggle.click();
    await page.locator("[data-test-datetime-trigger]").focus();
    await page.keyboard.press("Escape");
    await expect(hidden).toHaveCount(0);
    await expect(toggle).toBeFocused();
    await toggle.click();
    await hidden.locator("[data-test-tray-customize]").click();
    await expect(hidden).toHaveCount(0);
    await expect(page.locator('[data-test-window="cpanel"]').last().locator("[data-test-cpanel-notification]")).toBeVisible();
  });
}
