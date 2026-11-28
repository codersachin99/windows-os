import {expect,test} from "@playwright/test";

test("original Kubuntu renders its own Guest and 48px circular power artwork",async({page})=>{
  await page.goto("/?theme=kubuntu");
  const login=page.locator("[data-test-logon-screen]");
  await expect(login).toBeVisible({timeout:12000});
  await expect(login).toHaveAttribute("data-source-logon-renderer","kubuntu");
  await expect(login).toHaveAttribute("data-source-shell-status","pending");
  await expect(login).toHaveCSS("background-image",/kubuntu\.618268f7\.webp/);
  await expect(login).toHaveCSS("background-size","300% auto");
  const overlay=login.locator(".source-kubuntu-logon__overlay");
  await expect(overlay).toHaveCSS("background-color","rgba(0, 0, 0, 0.5)");
  await expect(overlay).toHaveCSS("backdrop-filter","blur(10px)");
  const guest=login.locator('[data-test-source-logon-avatar="kubuntu"]');
  await expect(guest.locator("img")).toHaveAttribute("src","/assets/images/guest-win10.a110df5a.webp");
  await expect(guest.locator("img")).toHaveAttribute("width","150");
  await expect(guest.locator("img")).toHaveCSS("opacity","0.8");
  await guest.hover();
  await expect(guest).toHaveCSS("box-shadow",/rgba\(255, 255, 255, 0\.2\)/);
  for(const [action,filename,gap] of [
    ["restart","restart-kubuntu.5c766c73.svg","4px"],
    ["shutdown","shutdown-kubuntu.146c3ea3.svg","8px"]
  ] as const){
    const button=login.locator("[data-test-logon-"+action+"]");
    await expect(button).toHaveCSS("gap",gap);
    await expect(button.locator("img")).toHaveCSS("width","48px");
    await expect(button.locator("img")).toHaveCSS("border-radius","50%");
    await expect(button.locator("img")).toHaveAttribute("src","/assets/images/"+filename);
    expect((await page.request.get("/assets/images/"+filename)).ok()).toBeTruthy();
    await button.hover();
    await expect(button.locator("img")).toHaveCSS("background-color","rgba(255, 255, 255, 0.2)");
    await expect(button).toHaveCSS("background-color","rgba(0, 0, 0, 0)");
  }
  expect((await page.request.get("/assets/images/kubuntu.618268f7.webp")).ok()).toBeTruthy();
  const bounds=(await login.locator(".source-kubuntu-logon__power").boundingBox())!;
  const viewport=page.viewportSize()!;
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.x+bounds.width).toBeLessThanOrEqual(viewport.width+1);
  await login.getByRole("button",{name:"Switch User"}).click();
  await expect(login.getByRole("dialog",{name:"Account login"})).toBeVisible();
  await login.getByRole("button",{name:"Back"}).click();
  await guest.click();
  await expect(page.locator('[data-test-main-screen][data-theme="kubuntu"]')).toBeVisible();
});

test("Kubuntu power controls use simulator shutdown and explicit Guest restart lifecycle",async({page})=>{
  await page.goto("/?theme=kubuntu");
  const login=page.locator("[data-test-logon-screen]");
  await expect(login).toBeVisible({timeout:12000});
  await login.locator("[data-test-logon-shutdown]").click();
  await expect(page.getByText("Windows is shutting down")).toBeVisible();
  await page.getByRole("button",{name:"Restart WindowsOS"}).click();
  await expect(login).toHaveAttribute("data-source-logon-renderer","kubuntu");
  await expect(page.locator("[data-test-main-screen]")).toHaveCount(0);
  await login.locator("[data-test-logon-restart]").click();
  await expect(login).toHaveAttribute("data-source-logon-renderer","kubuntu");
  await expect(page.locator("[data-test-main-screen]")).toHaveCount(0);
  await login.locator('[data-test-avatar="win7"]').click();
  await expect(page.locator('[data-test-main-screen][data-theme="kubuntu"]')).toBeVisible();
});
