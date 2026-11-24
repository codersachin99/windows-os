import {expect,test} from "@playwright/test";

test("ChromeOS renders original blurred wallpaper and avatar-only Guest with footer controls",async({page})=>{
  await page.goto("/?theme=chromeos");
  const login=page.locator("[data-test-logon-screen]");
  await expect(login).toBeVisible({timeout:12000});
  await expect(login).toHaveAttribute("data-source-logon-renderer","chromeos");
  await expect(login).toHaveAttribute("data-source-shell-status","pending");
  const top=login.locator(".source-chromeos-logon__overlay-top");
  const bottom=login.locator(".source-chromeos-logon__overlay-bottom");
  await expect(top).toHaveCSS("background-image",/chromeos\.eaca6e72\.webp/);
  await expect(top).toHaveCSS("filter","blur(24px)");
  await expect(bottom).toHaveCSS("filter","blur(24px)");
  await expect(bottom).toHaveCSS("background-color","rgba(0, 0, 0, 0.6)");
  const guest=login.locator('[data-test-source-logon-avatar="chromeos"]');
  await expect(guest.locator("img")).toHaveAttribute("src","/assets/images/usertile12.75a9eb89.webp");
  await expect(guest.locator("img")).toHaveAttribute("width","100");
  await guest.hover();
  await expect(guest).toHaveCSS("box-shadow",/rgba\(255, 255, 255, 0\.533/);
  await expect(login.getByRole("button",{name:"Sign in",exact:true})).toHaveCount(0);
  const footer=login.locator(".source-chromeos-logon__footer");
  await expect(footer.getByRole("button")).toHaveText(["Shutdown","Restart","Switch User"]);
  const actions=footer.getByRole("button",{name:"Switch User"});
  await expect(actions).toHaveCSS("background-color","rgba(230, 228, 228, 0.2)");
  await actions.hover();
  await expect(actions).toHaveCSS("background-color","rgba(230, 228, 228, 0.4)");
  await expect(footer.locator("[data-test-source-chromeos-clock]")).toHaveText(/^\d{2}:\d{2}$/);
  for(const filename of ["chromeos.eaca6e72.webp","usertile12.75a9eb89.webp"])
    expect((await page.request.get("/assets/images/"+filename)).ok()).toBeTruthy();
  const viewport=page.viewportSize()!;
  for(const locator of [footer,guest,actions]){
    const box=(await locator.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(-1);
    expect(box.x+box.width).toBeLessThanOrEqual(viewport.width+1);
    expect(box.y+box.height).toBeLessThanOrEqual(viewport.height+1);
  }
  await actions.click();
  await expect(login.getByRole("dialog",{name:"Account login"})).toBeVisible();
  await login.getByRole("button",{name:"Back"}).click();
  await guest.click();
  await expect(page.locator('[data-test-main-screen][data-theme="chromeos"]')).toBeVisible();
});

test("ChromeOS footer uses real simulator shutdown and restart without automatic Guest",async({page})=>{
  await page.goto("/?theme=chromeos");
  const login=page.locator("[data-test-logon-screen]");
  await expect(login).toBeVisible({timeout:12000});
  await login.locator("[data-test-logon-shutdown]").click();
  await expect(page.getByText("Windows is shutting down")).toBeVisible();
  await page.getByRole("button",{name:"Restart WindowsOS"}).click();
  await expect(login).toHaveAttribute("data-source-logon-renderer","chromeos");
  await login.locator("[data-test-logon-restart]").click();
  await expect(login).toHaveAttribute("data-source-logon-renderer","chromeos");
  await expect(page.locator("[data-test-main-screen]")).toHaveCount(0);
  await login.locator('[data-test-avatar="win7"]').click();
  await expect(page.locator('[data-test-main-screen][data-theme="chromeos"]')).toBeVisible();
});
