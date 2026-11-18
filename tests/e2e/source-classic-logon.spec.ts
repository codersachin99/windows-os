import {expect,test} from "@playwright/test";

/** Source logon-win31 and logon-win9x share a classic logon-window.
 * Theme recognition and Guest behavior do not establish pixel parity. */
test("Win31/95/98 source-shaped classic logon keeps Guest-only authentication",async({page})=>{
  for(const family of ["win31","win95","win98"] as const){
    await page.goto("/?theme="+family);
    const login=page.locator("[data-test-logon-screen]");
    await expect(login).toBeVisible({timeout:12000});
    await expect(login).toHaveAttribute("data-source-theme-id",family);
    await expect(login).toHaveAttribute("data-source-logon-theme",family);
    await expect(login).toHaveAttribute("data-source-logon-renderer",family);
    await expect(login).toHaveAttribute("data-source-shell-status","pending");
    await expect(login.getByRole("dialog",{name:"Logon Windows"})).toBeVisible();
    await expect(login.getByRole("textbox",{name:"User name"})).toBeVisible();
    await expect(login.locator("input[type=password]")).toBeVisible();
    await expect(page.locator("[data-test-main-screen]")).toHaveCount(0);
    // Original account form exists, but backend authentication is not invented.
    await login.getByRole("button",{name:"Logon",exact:true}).click();
    await expect(login.getByRole("dialog",{name:"Account login"})).toBeVisible();
    await login.getByRole("button",{name:"Back"}).click();
    await login.getByRole("button",{name:"Power options"}).click();
    await expect(login.locator("[data-test-logon-restart]")).toBeVisible();
    await expect(login.locator("[data-test-logon-shutdown]")).toBeVisible();
    const panel=await login.locator(".source-classic-logon__window").boundingBox();
    const viewport=page.viewportSize();
    expect(panel).not.toBeNull();
    expect(viewport).not.toBeNull();
    expect(panel!.x).toBeGreaterThanOrEqual(-1);
    expect(panel!.x+panel!.width).toBeLessThanOrEqual(viewport!.width+1);
    await login.locator('[data-test-avatar="win7"]').click();
    const desktop=page.locator("[data-test-main-screen]");
    await expect(desktop).toBeVisible();
    await expect(desktop).toHaveAttribute("data-theme",family);
  }
});

test("Win31 original grey background and Win9x decentered windows are distinct",async({page})=>{
  await page.goto("/?theme=win31");
  await expect(page.locator("[data-test-logon-screen]"))
    .toHaveCSS("background-color","rgb(191, 189, 192)");
  await expect(page.locator(".source-classic-logon__window"))
    .toHaveCSS("width",/px/);
  await page.goto("/?theme=win95");
  await expect(page.locator("[data-test-logon-screen]"))
    .toHaveClass(/is-win95/);
  await page.goto("/?theme=win98");
  await expect(page.locator("[data-test-logon-screen]"))
    .toHaveClass(/is-win98/);
});
