import {test,expect} from "@playwright/test";
test("ChromeOS base tray shares Action Center, live network, battery and volume",async({page,context})=>{
  await page.addInitScript(()=>{
    const battery=Object.assign(new EventTarget(),{level:.73,charging:false});
    Object.defineProperty(navigator,"getBattery",{configurable:true,value:()=>Promise.resolve(battery)});
  });
  await page.goto("/?theme=chromeos");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  const shell=page.locator("[data-test-main-screen]");
  const tray=shell.locator('[data-test-taskbar-tray="chromeos"]');
  const center=tray.locator("[data-test-action-center]");
  await center.click();
  const summary=tray.locator("[data-test-action-center-popup]");
  await expect(summary).toBeVisible();
  await expect(summary.locator("[data-test-notification-summary]")).toHaveText("No new messages");
  await expect(summary).toHaveCSS("border-top-left-radius","10px");
  const network=tray.locator("[data-test-network]");
  await network.press("Enter");
  await expect(summary).toHaveCount(0);
  const net=tray.locator("[data-test-network-popup]");
  await expect(net).toBeVisible();
  try{
    await context.setOffline(true);
    await expect(network.locator("img")).toHaveAttribute("src",/network-off/);
    await expect(net.getByRole("status")).toContainText("Browser reports offline");
  }finally{await context.setOffline(false);}
  await tray.locator("[data-test-battery]").press("Enter");
  await expect(net).toHaveCount(0);
  const battery=tray.locator("[data-test-battery-popup]");
  await expect(battery.locator("[data-test-battery-percent]")).toHaveText("73%");
  await battery.getByRole("radio",{name:"Power saver"}).check();
  await expect(shell).toHaveCSS("filter","brightness(0.6)");
  await battery.getByRole("radio",{name:"Balanced"}).check();
  await expect(shell).toHaveCSS("filter","none");
  const volume=tray.locator("[data-test-volume]");
  await volume.press("Enter");
  await expect(battery).toHaveCount(0);
  const mixer=tray.locator("[data-test-volume-popup]");
  await mixer.getByRole("slider").fill("40");
  await expect(volume.locator("img")).toHaveAttribute("src",/volume-32-win10/);
  await mixer.getByRole("button",{name:"Mute system"}).click();
  await expect(mixer.getByRole("slider")).toBeDisabled();
  await page.keyboard.press("Escape");
  await expect(mixer).toHaveCount(0);
  await expect(volume).toBeFocused();
  await center.click();
  await summary.locator("[data-test-open-action-center]").click();
  await expect(page.locator('[data-test-window="cpanel"]').last().locator("[data-test-cpanel-action-center]")).toBeVisible();
});
