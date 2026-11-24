import {expect,test} from "@playwright/test";

/** Bounded original legacy-win7@26b9f0ce7 logon-onebit.js / CSS
 * acceptance: actual Guest screen and source Onebit palette/hover,
 * never evidence of full theme, CAPTCHA or reference screenshot parity.
 */
test("Onebit Guest logon keeps the original dark/sand flat pixel controls",async({page})=>{
  await page.goto("/?theme=onebit");
  const login=page.locator("[data-test-logon-screen]");
  await expect(login).toBeVisible({timeout:12000});
  await expect(login).toHaveAttribute("data-source-theme-id","onebit");
  await expect(login).toHaveAttribute("data-source-logon-theme","onebit");
  await expect(login).toHaveAttribute("data-source-logon-renderer","onebit");
  await expect(login).toHaveAttribute("data-source-shell-status","pending");
  await expect(login).toHaveCSS("background-color","rgb(53, 43, 48)");
  await expect(login).toHaveCSS("color","rgb(230, 212, 191)");
  const guest=login.locator('[data-test-source-logon-avatar="onebit"]');
  await expect(guest).toBeVisible();
  await expect(guest).toHaveCSS("border-top-left-radius","0px");
  await expect(guest).toHaveCSS("box-shadow",/rgb\(230, 212, 191\)/);
  await expect(login.locator('[data-test-logon-shutdown]')).toBeVisible();
  await expect(login.locator('[data-test-logon-restart]')).toBeVisible();
  const pane=await login.locator(".source-onebit-logon__pane").boundingBox();
  const viewport=page.viewportSize()!;
  expect(pane).not.toBeNull();
  expect(pane!.x).toBeGreaterThanOrEqual(-1);
  expect(pane!.x+pane!.width).toBeLessThanOrEqual(viewport.width+1);
  await guest.hover();
  await expect(guest).toHaveCSS("background-color","rgb(230, 212, 191)");
  await expect(guest).toHaveCSS("color","rgb(53, 43, 48)");
  await login.getByRole("button",{name:"Switch User"}).click();
  await expect(login.getByRole("dialog",{name:"Account login"})).toBeVisible();
  await login.getByRole("button",{name:"Back"}).click();
  await expect(login.getByRole("dialog",{name:"Account login"})).toHaveCount(0);
  await guest.click();
  const desktop=page.locator('[data-test-main-screen][data-theme="onebit"]');
  await expect(desktop).toBeVisible();
  await expect(login).toHaveCount(0);
});
