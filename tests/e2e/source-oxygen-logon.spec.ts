import {expect,test} from "@playwright/test";

test("Oxygen uses original source Guest avatar, overlay and centered power artwork",async({page})=>{
  await page.goto("/?theme=oxygen");
  const login=page.locator("[data-test-logon-screen]");
  await expect(login).toBeVisible({timeout:12000});
  await expect(login).toHaveAttribute("data-source-logon-renderer","oxygen");
  await expect(login).toHaveAttribute("data-source-shell-status","pending");
  await expect(login).toHaveCSS("background-image",/oxygen\.414aed47\.svg/);
  const overlay=login.locator(".source-oxygen-logon__overlay");
  await expect(overlay).toHaveCSS("background-color","rgba(0, 0, 0, 0.5)");
  await expect(overlay).toHaveCSS("backdrop-filter","blur(10px)");
  const guest=login.locator('[data-test-source-logon-avatar="oxygen"]');
  await expect(guest).toHaveCSS("padding","6px");
  await expect(guest.locator("img")).toHaveAttribute("src","/assets/images/guest.1a7eab2b.webp");
  await expect(guest.locator("img")).toHaveAttribute("width","128");
  await guest.hover();
  await expect(guest).toHaveCSS("box-shadow",/rgba\(255, 255, 255, 0\.6\)/);
  for(const [action,filename] of [
    ["restart","restart-oxygen.d4450a1a.webp"],
    ["shutdown","shutdown-oxygen.62df7a25.webp"]
  ] as const){
    const button=login.locator("[data-test-logon-"+action+"]");
    await expect(button).toHaveCSS("min-width","96px");
    await expect(button.locator("img")).toHaveCSS("width","40px");
    await expect(button.locator("img")).toHaveAttribute("src","/assets/images/"+filename);
    expect((await page.request.get("/assets/images/"+filename)).ok()).toBeTruthy();
  }
  expect((await page.request.get("/assets/images/oxygen.414aed47.svg")).ok()).toBeTruthy();
  const power=(await login.locator(".source-oxygen-logon__power").boundingBox())!;
  expect(Math.abs(power.x+power.width/2-page.viewportSize()!.width/2)).toBeLessThan(2);
  const switchUser=login.getByRole("button",{name:"Switch User"});
  const switchBounds=(await switchUser.boundingBox())!;
  expect(switchBounds.y+switchBounds.height).toBeLessThan(power.y);
  await switchUser.click();
  await expect(login.getByRole("dialog",{name:"Account login"})).toBeVisible();
  await login.getByRole("button",{name:"Back"}).click();
  await guest.click();
  await expect(page.locator('[data-test-main-screen][data-theme="oxygen"]')).toBeVisible();
});
