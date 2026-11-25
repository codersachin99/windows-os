import {test,expect} from "@playwright/test";
for(const [theme,surface,header] of [
  ["winxp","rgb(236, 233, 216)","rgb(122, 150, 223)"],
  ["winxpE","rgb(235, 233, 237)","rgb(111, 161, 217)"],
  ["winxpG","rgb(236, 233, 216)","rgb(218, 221, 191)"],
  ["winxpN","rgb(235, 233, 237)","rgb(111, 161, 217)"],
  ["winxpR","rgb(235, 233, 237)","rgb(111, 161, 217)"],
  ["winxpS","rgb(224, 223, 227)",null],
  ["winxpZ","rgb(226, 226, 226)","rgb(111, 161, 217)"]
] as const){
  test(theme+" original tray artwork, opaque bevel and calendar",async({page,context})=>{
    await page.addInitScript(()=>{
      const battery=Object.assign(new EventTarget(),{level:.73,charging:true});
      Object.defineProperty(navigator,"getBattery",{configurable:true,value:()=>Promise.resolve(battery)});
    });
    await page.goto("/?theme="+theme);
    await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
    const tray=page.locator('[data-test-taskbar-tray="'+theme+'"]');
    await expect(tray.locator("[data-test-action-center] img")).toHaveAttribute("src","/assets/images/action-center-winxp.52f44912.webp");
    const network=tray.locator("[data-test-network]");
    await expect(network.locator("img")).toHaveAttribute("src","/assets/images/network-winxp.744648d4.webp");
    try{
      await context.setOffline(true);
      await expect(network.locator("img")).toHaveAttribute("src","/assets/images/network-off-winxp.60414007.webp");
    }finally{await context.setOffline(false);}
    await expect(tray.locator("[data-test-battery] img")).toHaveAttribute("src","/assets/images/battery-charging-winxp.321f84b7.webp");
    const volume=tray.locator("[data-test-volume]");
    await volume.click();
    const mixer=tray.locator("[data-test-volume-popup]");
    await expect(mixer).toHaveCSS("background-color",surface);
    await expect(mixer).toHaveCSS("box-shadow",/inset/);
    await mixer.getByRole("slider").fill("40");
    await expect(volume.locator("img")).toHaveAttribute("src","/assets/images/sound-winxp.1ff35c0e.webp");
    await mixer.getByRole("button",{name:"Mute system"}).click();
    await expect(volume.locator("img")).toHaveAttribute("src","/assets/images/volume-muted-winxp.70d8b244.webp");
    await tray.locator("[data-test-datetime-trigger]").press("Enter");
    await expect(mixer).toHaveCount(0);
    const popup=tray.locator("[data-test-datetime-popup]");
    await expect(popup).toHaveCSS("background-color",surface);
    if(header)await expect(popup.locator(".source-macos-calendar-weekdays")).toHaveCSS("background-color",header);
    if(theme==="winxpS")await expect(popup.locator(".source-macos-calendar-weekdays")).toHaveCSS("color","rgb(161, 161, 146)");
    await expect(popup.locator(".source-xp-clock-mark")).toHaveCount(60);
    await popup.getByRole("button",{name:"Next month"}).click();
    await page.keyboard.press("Escape");
    await expect(popup).toHaveCount(0);
  });
}
