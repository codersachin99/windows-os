import {expect,test} from "@playwright/test";

/** Frozen legacy-win7@26b9f0ce7 original logon-winw.js and CSS:
 * separate Whistler logon, original image, blue vertical rail,
 * orange Welcome, navy instruction and direct power actions.
 * Does not claim source screenshot parity or port account auth.
 */
test("original WinW logon renders Whistler layout, real logo and Guest session",async({page})=>{
  await page.goto("/?theme=winW");
  const login=page.locator("[data-test-logon-screen]");
  await expect(login).toBeVisible({timeout:12000});
  await expect(login).toHaveAttribute("data-source-theme-id","winW");
  await expect(login).toHaveAttribute("data-source-logon-theme","winW");
  await expect(login).toHaveAttribute("data-source-logon-renderer","winW");
  await expect(login).toHaveAttribute("data-source-shell-status","pending");
  await expect(login).toHaveCSS("background-color","rgb(255, 255, 255)");
  const rail=login.locator(".source-winw-logon__rail");
  await expect(rail).toHaveCSS("background-color","rgb(41, 93, 168)");
  await expect(rail).toHaveCSS("writing-mode","sideways-lr");
  const logo=login.locator('[data-test-source-logon-logo="winW"]');
  await expect(logo).toHaveAttribute("src","/assets/images/logowhistler.73c9045c.webp");
  const response=await page.request.get("/assets/images/logowhistler.73c9045c.webp");
  expect(response.ok()).toBeTruthy();
  expect(response.headers()["content-type"]).toContain("image/webp");
  await expect(login.getByRole("heading",{name:"Welcome"})).toHaveCSS("color","rgb(255, 165, 0)");
  await expect(login.locator(".source-winw-logon__header p"))
    .toHaveCSS("color","rgb(0, 0, 128)");
  await expect(login.getByText("To manage or change user accounts, go to Control Panel")).toBeVisible();
  const bounds=await login.locator(".source-winw-logon__main").boundingBox();
  const vp=page.viewportSize()!;
  expect(bounds).not.toBeNull();
  expect(bounds!.x).toBeGreaterThanOrEqual(-1);
  expect(bounds!.x+bounds!.width).toBeLessThanOrEqual(vp.width+1);
  await expect(login.locator("[data-test-logon-restart]")).toBeVisible();
  await expect(login.locator("[data-test-logon-shutdown]")).toBeVisible();
  await login.getByRole("button",{name:"Switch User"}).click();
  await expect(login.getByRole("dialog",{name:"Account login"})).toBeVisible();
  await login.getByRole("button",{name:"Back"}).click();
  await expect(login.getByRole("dialog",{name:"Account login"})).toHaveCount(0);
  await login.locator('[data-test-source-logon-avatar="winW"]').click();
  await expect(page.locator('[data-test-main-screen][data-theme="winW"]')).toBeVisible();
});
