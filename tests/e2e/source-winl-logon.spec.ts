import {expect,test} from "@playwright/test";

/** Frozen legacy-win7@26b9f0ce7 logon-winl.js c17d:
 * winLS and winLP share the same Guest/power renderer, original
 * login-winL artwork and 512x320 gray-white login frame. This does
 * not claim whole-theme pixel parity or account authentication.
 */
for(const theme of ["winLS","winLP"] as const){
  test(theme+" shared original WinL logon preserves source artwork and Guest session",async({page})=>{
    await page.goto("/?theme="+theme);
    const login=page.locator("[data-test-logon-screen]");
    await expect(login).toBeVisible({timeout:12000});
    await expect(login).toHaveAttribute("data-source-theme-id",theme);
    await expect(login).toHaveAttribute("data-source-logon-theme","winLS");
    await expect(login).toHaveAttribute("data-source-logon-renderer","winLS");
    await expect(login).toHaveAttribute("data-source-shell-status","pending");
    await expect(login).toHaveCSS("background-image",/login-winL\.d27b081a\.webp/);
    const image=await page.request.get("/assets/images/login-winL.d27b081a.webp");
    expect(image.ok()).toBeTruthy();
    expect(image.headers()["content-type"]).toContain("image/webp");
    const frame=login.locator(".source-winl-logon__container");
    await expect(frame).toHaveCSS("border-top-left-radius","6px");
    await expect(frame).toHaveCSS("background-image",/linear-gradient/);
    const bounds=await frame.boundingBox();
    const vp=page.viewportSize()!;
    expect(bounds).not.toBeNull();
    expect(bounds!.x).toBeGreaterThanOrEqual(-1);
    expect(bounds!.x+bounds!.width).toBeLessThanOrEqual(vp.width+1);
    expect(bounds!.y+bounds!.height).toBeLessThanOrEqual(vp.height+1);
    if(vp.width>540)expect(Math.abs(bounds!.width-512)).toBeLessThanOrEqual(1);
    await expect(login.locator(".source-winl-logon__pane"))
      .toHaveCSS("background-color","rgb(255, 255, 255)");
    await expect(login.locator('[data-test-source-logon-logo="winLS"]'))
      .toHaveAttribute("src","/assets/images/start-button-winxp.a3485adf.webp");
    const avatar=login.locator('[data-test-source-logon-avatar="winLS"]');
    await expect(avatar.locator("img"))
      .toHaveAttribute("src","/assets/images/guest-win10.a110df5a.webp");
    await expect(avatar.locator("img")).toHaveCSS("width","100px");
    await expect(login.locator("[data-test-logon-shutdown]")).toBeVisible();
    await expect(login.locator("[data-test-logon-restart]")).toBeVisible();
    await login.getByRole("button",{name:"Switch User"}).click();
    await expect(login.getByRole("dialog",{name:"Account login"})).toBeVisible();
    await login.getByRole("button",{name:"Back"}).click();
    await expect(login.getByRole("dialog",{name:"Account login"})).toHaveCount(0);
    await avatar.click();
    await expect(page.locator('[data-test-main-screen][data-theme="'+theme+'"]')).toBeVisible();
  });
}
