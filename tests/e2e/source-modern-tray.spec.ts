import {test,expect} from "@playwright/test";
for(const theme of ["win8","win81","win10","win11","win11dark"] as const){
  test(theme+" interactive tray and source calendar family",async({page})=>{
    await page.goto("/?theme="+theme);
    await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
    const tray=page.locator('[data-test-taskbar-tray="'+theme+'"]');
    await tray.locator("[data-test-volume]").click();
    const mixer=tray.locator("[data-test-volume-popup]");
    await expect(mixer).toBeVisible();
    await mixer.getByRole("slider").fill("42");
    await expect(mixer.getByRole("slider")).toHaveValue("42");
    await mixer.getByRole("button",{name:"Mute system"}).click();
    await expect(mixer.getByRole("slider")).toBeDisabled();
    const trigger=tray.locator("[data-test-datetime-trigger]");
    await trigger.press("Enter");
    await expect(mixer).toHaveCount(0);
    const popup=tray.locator("[data-test-datetime-popup]");
    await expect(popup).toBeVisible();
    const today=popup.locator(".source-macos-calendar-days .is-today");
    if(theme==="win8"||theme==="win81"){
      await expect(popup.locator("[data-test-source-analog-clock]")).toBeVisible();
      await expect(today).toHaveCSS("border-top-style","dotted");
    }else{
      await expect(popup.locator("[data-test-source-analog-clock]")).toHaveCount(0);
      await expect(popup.locator("[data-test-source-digital-seconds]")).toBeVisible();
      await expect(popup).toHaveCSS("background-color",theme==="win10"?"rgb(31, 31, 31)":theme==="win11"?"rgb(249, 249, 249)":"rgb(36, 36, 36)");
      await expect(today).toHaveCSS("height",theme==="win10"?"30px":"40px");
      await expect(today).toHaveCSS("border-top-left-radius",theme==="win10"?"0px":"99px");
    }
    await popup.getByRole("button",{name:"Next month"}).click();
    await popup.getByRole("button",{name:"Choose month"}).click();
    await expect(popup.getByRole("button",{name:"Jan",exact:true})).toBeVisible();
    await trigger.press("Escape");
    await trigger.press("Escape");
    await expect(popup).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await tray.locator("[data-test-network]").click();
    await expect(tray.locator("[data-test-network-popup]")).toBeVisible();
    const network=tray.locator("[data-test-network]");
    if(theme==="win8"||theme==="win81")await expect(network.locator("img")).toHaveAttribute("src",/network\.21b75845/);
    else await expect(network.locator("svg")).toBeVisible();
    await expect(tray.locator("[data-test-network-popup] img")).toHaveAttribute("src",/network-(wired|signal)\./);
  });
}
