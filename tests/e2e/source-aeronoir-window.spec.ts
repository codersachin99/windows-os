import {test,expect} from "@playwright/test";
test("Aero Noir WindowMain source gloss and caption controls retain window lifecycle",async({page})=>{
  await page.goto("/?theme=aeroNoir");
  await page.locator('[data-test-source-logon-avatar="aeroNoir"]').click({timeout:12000});
  const shell=page.locator('[data-test-main-screen][data-theme="aeroNoir"]');
  await shell.locator('[data-test-desktop-icon="computer"]').dblclick();
  const win=shell.locator('[data-test-window="computer"]');
  await expect(win).toBeVisible();
  await expect(win).toHaveClass(/is-active/);
  await expect(win).toHaveCSS("border-top-left-radius","6px");
  await expect(win).toHaveCSS("background-image",/linear-gradient.*linear-gradient/);
  await expect(win.locator(".windows-window__body")).toHaveCSS("background-image",/linear-gradient/);
  const minimize=win.locator('[data-source-window-control="minimize"]');
  const maximize=win.locator('[data-source-window-control="maximize"]');
  const close=win.locator('[data-source-window-control="close"]');
  for (const button of [minimize,maximize,close]){
    await expect(button).toHaveCSS("width","23px");
    await expect(button).toHaveCSS("height","23px");
    await expect(button).toHaveCSS("border-top-left-radius","50%");
    await expect(button).toHaveCSS("margin-inline-start","5px");
  }
  await expect(minimize).toHaveCSS("background-color","rgb(95, 212, 95)");
  await expect(maximize).toHaveCSS("background-color","rgb(204, 163, 87)");
  await expect(close).toHaveCSS("background-color","rgb(190, 82, 82)");
  await maximize.click();
  await expect(win).toHaveCSS("border-top-left-radius","0px");
  await win.locator('[data-source-window-control="restore"]').click();
  await expect(win).toHaveCSS("border-top-left-radius","6px");
  await minimize.click();
  await expect(win).toHaveCount(0);
  await shell.locator('[data-test-taskbar-pin="computer"],[data-test-taskbar-running-group="computer"]').first().click();
  await expect(win).toBeVisible();
  await close.click();
  await expect(win).toHaveCount(0);
});
