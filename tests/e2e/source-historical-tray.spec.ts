import {test,expect} from "@playwright/test";
for(const [theme,surface] of [
  ["win31","rgb(192, 192, 192)"],["win95","rgb(189, 190, 189)"],
  ["win98","rgb(192, 199, 200)"],["win2k","rgb(212, 208, 200)"],
  ["winW","rgb(235, 235, 228)"],["winLP","rgb(217, 230, 244)"],["winLS","rgb(234, 232, 234)"]
] as const){
  test(theme+" historical tray functional controls and opaque popup",async({page,context})=>{
    await page.goto("/?theme="+theme);
    await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
    const tray=page.locator('[data-test-taskbar-tray="'+theme+'"]');
    const retro=["win31","win95","win98","win2k"].includes(theme);
    const network=tray.locator("[data-test-network]");
    await network.click();
    await expect(tray.locator("[data-test-network-popup]")).toBeVisible();
    if(retro){
      await expect(network.locator("img")).toHaveAttribute("src",/network-win2k/);
      try{await context.setOffline(true);await expect(network.locator("img")).toHaveAttribute("src",/network-off-win2k/);}
      finally{await context.setOffline(false);}
    }
    const volume=tray.locator("[data-test-volume]");
    await volume.press("Enter");
    const mixer=tray.locator("[data-test-volume-popup]");
    await expect(mixer).toHaveCSS("background-color",surface);
    await mixer.getByRole("slider").fill("35");
    await expect(mixer.getByRole("slider")).toHaveValue("35");
    if(retro)await expect(volume.locator("img")).toHaveAttribute("src",/sound-win2k/);
    await mixer.getByRole("button",{name:"Mute system"}).click();
    if(retro)await expect(volume.locator("img")).toHaveAttribute("src",/sound-muted-win2k/);
    await tray.locator("[data-test-datetime-trigger]").press("Enter");
    await expect(mixer).toHaveCount(0);
    const popup=tray.locator("[data-test-datetime-popup]");
    await expect(popup).toHaveCSS("background-color",surface);
    await expect(popup.locator("[data-test-source-analog-clock]")).toBeVisible();
    if(retro)await expect(popup.locator(".source-xp-clock-mark")).toHaveCount(60);
    await popup.getByRole("button",{name:"Next month"}).click();
    await tray.locator("[data-test-datetime-trigger]").press("Escape");
    await expect(popup).toHaveCount(0);
  });
}
