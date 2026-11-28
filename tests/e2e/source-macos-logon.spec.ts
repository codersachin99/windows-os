import {expect,test} from "@playwright/test";

test("macOS logon uses original wallpaper and avatar-only Guest with centered source footer",async({page})=>{
  await page.goto("/?theme=macos");
  const login=page.locator("[data-test-logon-screen]");
  await expect(login).toBeVisible({timeout:12000});
  await expect(login).toHaveAttribute("data-source-logon-renderer","macos");
  await expect(login).toHaveAttribute("data-source-shell-status","pending");
  await expect(login).toHaveCSS("background-image",/macos\.54af5cd4\.webp/);
  await expect(login).toHaveCSS("background-size","cover");
  const overlay=login.locator(".source-macos-logon__overlay");
  await expect(overlay).toHaveCSS("background-color","rgba(0, 0, 0, 0.5)");
  await expect(overlay).toHaveCSS("backdrop-filter","blur(10px)");
  const guest=login.locator('[data-test-source-logon-avatar="macos"]');
  await expect(guest.locator("img")).toHaveAttribute("src","/assets/images/guest-macos.caf967b3.webp");
  await expect(guest.locator("img")).toHaveAttribute("width","150");
  await guest.hover();
  await expect(guest).toHaveCSS("box-shadow",/rgba\(255, 255, 255, 0\.2\)/);
  await expect(login.getByRole("button",{name:"Sign in",exact:true})).toHaveCount(0);
  const footer=login.locator(".source-macos-logon__actions");
  await expect(footer.getByRole("button")).toHaveText(["Shutdown","Switch User","Restart"]);
  for(const kind of ["shutdown","switch","restart"]){
    const icon=footer.locator('[data-source-action="'+kind+'"]');
    await expect(icon).toHaveCSS("width","36px");
    await expect(icon).toHaveCSS("height","36px");
    await expect(icon).toHaveCSS("background-color","rgba(230, 228, 228, 0.2)");
  }
  await expect(footer.locator('[data-source-action="restart"]')).toHaveCSS("transform","matrix(-1, 0, 0, -1, 0, 0)");
  const switchUser=footer.getByRole("button",{name:"Switch User"});
  await switchUser.focus();
  await expect(switchUser.locator(".source-macos-logon__action-icon")).toHaveCSS("background-color","rgba(230, 228, 228, 0.4)");
  for(const filename of ["macos.54af5cd4.webp","guest-macos.caf967b3.webp"])
    expect((await page.request.get("/assets/images/"+filename)).ok()).toBeTruthy();
  const viewport=page.viewportSize()!;
  const box=(await footer.boundingBox())!;
  expect(Math.abs(box.x+box.width/2-viewport.width/2)).toBeLessThan(2);
  expect(box.x).toBeGreaterThanOrEqual(-1);
  expect(box.x+box.width).toBeLessThanOrEqual(viewport.width+1);
  await switchUser.click();
  await expect(login.getByRole("dialog",{name:"Account login"})).toBeVisible();
  await login.getByRole("button",{name:"Back"}).click();
  await guest.click();
  await expect(page.locator('[data-test-main-screen][data-theme="macos"]')).toBeVisible();
});

test("macOS footer shutdown and restart preserve explicit Guest entry",async({page})=>{
  await page.goto("/?theme=macos");
  const login=page.locator("[data-test-logon-screen]");
  await expect(login).toBeVisible({timeout:12000});
  await login.locator("[data-test-logon-shutdown]").click();
  await expect(page.getByText("Windows is shutting down")).toBeVisible();
  await page.getByRole("button",{name:"Restart WindowsOS"}).click();
  await expect(login).toHaveAttribute("data-source-logon-renderer","macos");
  await login.locator("[data-test-logon-restart]").click();
  await expect(login).toHaveAttribute("data-source-logon-renderer","macos");
  await expect(page.locator("[data-test-main-screen]")).toHaveCount(0);
  await login.locator('[data-test-avatar="win7"]').click();
  await expect(page.locator('[data-test-main-screen][data-theme="macos"]')).toBeVisible();
});
