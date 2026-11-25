import {test,expect} from "@playwright/test";
test("Win7 base tray shares Action Center, live network, battery and volume",async({page,context})=>{
  await page.addInitScript(()=>{
    const battery=Object.assign(new EventTarget(),{level:.73,charging:false});
    Object.defineProperty(navigator,"getBattery",{configurable:true,value:()=>Promise.resolve(battery)});
  });
  await page.goto("/?theme=win7");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  const shell=page.locator("[data-test-main-screen]");
  const tray=shell.locator('[data-test-taskbar-tray="win7"]');
  const center=tray.locator("[data-test-action-center]");
  await center.click();
  const summary=tray.locator("[data-test-action-center-popup]");
  await expect(summary).toBeVisible();
  await expect(summary.locator("[data-test-notification-summary]")).toHaveText("No new messages");
  await expect(summary).toHaveCSS("border-top-left-radius","7px");
  await expect(summary).toHaveCSS("border-top-color","rgb(0, 0, 0)");
  await expect(summary).toHaveCSS("background-image",/linear-gradient/);
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
  await tray.locator("[data-test-datetime-trigger]").click();
  const calendar=tray.locator("[data-test-datetime-popup]");
  await expect(calendar).toBeVisible();
  await expect(calendar).toHaveCSS("border-top-left-radius","7px");
  await expect(calendar).toHaveCSS("background-image",/linear-gradient/);
  await expect(calendar.locator("[data-test-source-analog-clock] svg")).toHaveCSS("width","128px");
  await expect(calendar.locator("[data-test-source-digital-seconds]")).toBeVisible();
  const bounds=(await calendar.boundingBox())!,bar=(await shell.locator(".windows-taskbar").boundingBox())!;
  expect(bounds.y+bounds.height).toBeLessThanOrEqual(bar.y+2);
  expect(bounds.x).toBeGreaterThanOrEqual(-2);
  await calendar.getByRole("button",{name:"Next month"}).click();
  await calendar.getByRole("button",{name:"Choose month"}).click();
  await expect(calendar.getByRole("button",{name:"Jan",exact:true})).toBeVisible();
  await calendar.getByRole("button",{name:"Jan",exact:true}).click();
  await expect(calendar.getByRole("button",{name:"Choose month"})).toHaveText("January");
  await center.press("Enter");
  await expect(calendar).toHaveCount(0);
  await summary.locator("[data-test-open-action-center]").click();
  await expect(page.locator('[data-test-window="cpanel"]').last().locator("[data-test-cpanel-action-center]")).toBeVisible();
});

for(const theme of ["aero-1","aero-2","aero-3","aero-4","basic-1"] as const){
  test(theme+" uses interactive Win7 tray and original calendar skin",async({page})=>{
    await page.goto("/?theme="+theme);
    await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
    const tray=page.locator('[data-test-taskbar-tray="'+theme+'"]');
    const clock=tray.locator("[data-test-datetime-trigger]");
    await clock.click();
    const popup=tray.locator("[data-test-datetime-popup]");
    await expect(popup).toBeVisible();
    await expect(popup).toHaveCSS("border-top-left-radius",theme==="basic-1"?"0px":"7px");
    if(theme==="basic-1")await expect(popup).toHaveCSS("box-shadow","none");
    await expect(popup.locator(".source-macos-calendar-days .is-today")).toHaveCSS("border-top-style","dotted");
    await expect(popup.locator("[data-test-source-analog-clock] svg")).toHaveCSS("background-color","rgb(224, 230, 233)");
    await page.keyboard.press("Escape");
    await expect(popup).toHaveCount(0);
    await expect(clock).toBeFocused();
  });
}
