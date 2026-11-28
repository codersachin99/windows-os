import {expect,test} from "@playwright/test";

test("Vista uses shared framed Guest with exact Vista wallpaper, Professional branding and source power art",async({page})=>{
  await page.goto("/?theme=winvista");
  const login=page.locator("[data-test-logon-screen]");
  await expect(login).toBeVisible({timeout:12000});
  await expect(login).toHaveAttribute("data-source-logon-renderer","winvista");
  await expect(login).toHaveAttribute("data-source-shell-status","partial");
  await expect(login).toHaveCSS("background-image",/login-winvista\.7a523d62\.webp/);
  await expect(login).toHaveCSS("background-size","cover");
  const guest=login.locator('[data-test-source-logon-avatar="winvista"]');
  await expect(guest).toHaveClass(/has-frame/);
  await expect(guest).toHaveCSS("background-image",/acc-frame\.8481679a\.webp/);
  const footer=login.locator(".windows-logon__footer");
  await expect(footer).toContainText("Windows Vista");
  await expect(footer).toContainText("Professional");
  await expect(footer).not.toContainText("Simulator");
  await expect(footer.locator("img")).toHaveAttribute("width","32");
  await expect(footer.locator("img")).toHaveAttribute("src","/assets/images/start-button-classic.ec7b0b9f.webp");
  const power=login.locator(".windows-logon__power");
  await expect(power).toHaveCSS("background-image",/shutdown\.08d3f74a\.webp/);
  await expect(power.locator("[data-test-logon-shutdown]")).toHaveCSS("width","42px");
  for(const filename of ["login-winvista.7a523d62.webp","shutdown.08d3f74a.webp"])
    expect((await page.request.get("/assets/images/"+filename)).ok()).toBeTruthy();
  const viewport=page.viewportSize()!;
  for(const locator of [footer,power]){
    const box=(await locator.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(-1);
    expect(box.x+box.width).toBeLessThanOrEqual(viewport.width+1);
  }
  await login.getByRole("button",{name:"Switch User"}).click();
  await expect(login.getByRole("dialog",{name:"Account login"})).toBeVisible();
  await login.getByRole("button",{name:"Back"}).click();
  await login.getByRole("button",{name:"Power options"}).click();
  await expect(login.locator("[data-test-logon-restart]")).toBeVisible();
  await guest.click();
  await expect(page.locator('[data-test-main-screen][data-theme="winvista"]')).toBeVisible();
});
