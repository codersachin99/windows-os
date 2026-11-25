import {test,expect} from "@playwright/test";
test("Onebit tray uses source icons, palette and functional controls",async({page,context})=>{
  await page.goto("/?theme=onebit");
  await page.locator('[data-test-source-logon-avatar="onebit"]').click({timeout:12000});
  const tray=page.locator('[data-test-taskbar-tray="onebit"]');
  await expect(tray.locator("[data-test-action-center] img")).toHaveAttribute("src",/action-center-onebit/);
  const network=tray.locator("[data-test-network]");
  await expect(network.locator("img")).toHaveAttribute("src",/network-onebit/);
  try{
    await context.setOffline(true);
    await expect(network.locator("img")).toHaveAttribute("src",/network-off-onebit/);
  }finally{await context.setOffline(false);}
  const volume=tray.locator("[data-test-volume]");
  await volume.click();
  const mixer=tray.locator("[data-test-volume-popup]");
  await expect(mixer).toHaveCSS("background-color","rgb(53, 43, 48)");
  await expect(mixer).toHaveCSS("color","rgb(230, 212, 191)");
  await mixer.getByRole("slider").fill("42");
  await expect(volume.locator("img")).toHaveAttribute("src",/volume-0-onebit/);
  await mixer.getByRole("slider").fill("70");
  await expect(volume.locator("img")).toHaveAttribute("src",/volume-1-onebit/);
  await mixer.getByRole("button",{name:"Mute system"}).click();
  await expect(volume.locator("img")).toHaveAttribute("src",/volume-off-onebit/);
  await tray.locator("[data-test-datetime-trigger]").press("Enter");
  const popup=tray.locator("[data-test-datetime-popup]");
  await expect(popup).toBeVisible();
  await expect(popup.locator(".source-macos-calendar-days .is-today")).toHaveCSS("background-color","rgb(230, 212, 191)");
  await expect(popup.locator("[data-test-source-analog-clock]")).toBeVisible();
  await popup.getByRole("button",{name:"Next month"}).click();
  await tray.locator("[data-test-datetime-trigger]").press("Escape");
  await expect(popup).toHaveCount(0);
});
