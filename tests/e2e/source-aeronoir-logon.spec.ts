import {expect,test} from "@playwright/test";

/** Exact legacy-win7@26b9f0ce7 logon-aeronoir source theme slice:
 * original wallpaper and KDE power art, black 50% backdrop, 10px blur,
 * round 150px Guest avatar. Not full shell or screenshot parity.
 */
test("source Aero Noir renders dark blurred Guest screen and functional original power controls",async({page})=>{
  await page.goto("/?theme=aeroNoir");
  const login=page.locator("[data-test-logon-screen]");
  await expect(login).toBeVisible({timeout:12000});
  await expect(login).toHaveAttribute("data-source-theme-id","aeroNoir");
  await expect(login).toHaveAttribute("data-source-logon-theme","aeroNoir");
  await expect(login).toHaveAttribute("data-source-logon-renderer","aeroNoir");
  await expect(login).toHaveAttribute("data-source-shell-status","pending");
  await expect(login).toHaveCSS("background-image",/aeroNoir\.237e6377\.webp/);
  await expect(login).toHaveCSS("background-size","300%");
  const overlay=login.locator(".source-aeronoir-logon__overlay");
  await expect(overlay).toHaveCSS("background-color","rgba(0, 0, 0, 0.5)");
  await expect(overlay).toHaveCSS("backdrop-filter","blur(10px)");
  const art=["aeroNoir.237e6377.webp",
    "restart-kubuntu.5c766c73.svg",
    "shutdown-kubuntu.146c3ea3.svg"];
  for(const item of art){
    const res=await page.request.get("/assets/images/"+item);
    expect(res.ok(),item).toBeTruthy();
    expect(res.headers()["content-type"],item).toContain(
      item.endsWith(".webp")?"image/webp":"image/svg+xml");
  }
  const guest=login.locator('[data-test-source-logon-avatar="aeroNoir"]');
  await expect(guest).toHaveCSS("border-radius","50%");
  await expect(guest.locator("img"))
    .toHaveAttribute("src","/assets/images/guest-win10.a110df5a.webp");
  await expect(guest.locator("img")).toHaveCSS("width","150px");
  await guest.hover();
  await expect(guest).toHaveCSS("box-shadow",/rgba\(255, 255, 255, 0\.2\)/);
  const restart=login.locator("[data-test-logon-restart]");
  const shutdown=login.locator("[data-test-logon-shutdown]");
  await expect(restart.locator("img"))
    .toHaveAttribute("src","/assets/images/restart-kubuntu.5c766c73.svg");
  await expect(shutdown.locator("img"))
    .toHaveAttribute("src","/assets/images/shutdown-kubuntu.146c3ea3.svg");
  await expect(restart.locator("img")).toHaveCSS("width","36px");
  await expect(shutdown.locator("img")).toHaveCSS("width","36px");
  const panel=await login.locator(".source-aeronoir-logon__account").boundingBox();
  const viewport=page.viewportSize()!;
  expect(panel).not.toBeNull();
  expect(panel!.x).toBeGreaterThanOrEqual(-1);
  expect(panel!.x+panel!.width).toBeLessThanOrEqual(viewport.width+1);
  await login.getByRole("button",{name:"Other user"}).click();
  await expect(login.getByRole("dialog",{name:"Account login"})).toBeVisible();
  await login.getByRole("button",{name:"Back"}).click();
  await expect(login.getByRole("dialog",{name:"Account login"})).toHaveCount(0);
  await guest.click();
  await expect(page.locator('[data-test-main-screen][data-theme="aeroNoir"]')).toBeVisible();
});
