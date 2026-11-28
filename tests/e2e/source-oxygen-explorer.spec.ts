import {test,expect} from "@playwright/test";
test("Oxygen Computer and Bin use source gradient surfaces and row selection",async({page})=>{
  await page.goto("/?theme=oxygen");
  await page.locator('[data-test-source-logon-avatar="oxygen"]').click({timeout:12000});
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const win=page.locator('[data-test-window="computer"]').first();
  await expect(win.locator(".explorer-address")).toHaveCSS("background-color","rgb(42, 46, 50)");
  await expect(win.locator(".explorer-address__location-wrapper")).toHaveCSS("background-color","rgb(42, 46, 50)");
  await expect(win.locator(".explorer-navigation")).toHaveCSS("background-color","rgb(42, 46, 50)");
  await expect(win.locator(".explorer-content")).toHaveCSS("background-color","rgb(42, 46, 50)");
  await expect(win.locator(".explorer-command")).toHaveCSS("background-color","rgb(42, 46, 50)");
  const desktop=win.getByRole("button",{name:"Desktop",exact:true});
  await desktop.click();
  await expect(desktop).toHaveAttribute("aria-current","location");
  await expect.poll(()=>desktop.evaluate(el=>getComputedStyle(el,"::before").opacity)).toBe("0.7");
  await win.locator('input[type="file"][aria-label="Upload files"]').setInputFiles({
    name:"Oxygen Selection.txt",mimeType:"text/plain",buffer:Buffer.from("Guest file")
  });
  const item=win.locator('[data-test-explorer-item="Oxygen Selection.txt"]');
  const view=win.getByRole("combobox",{name:"Explorer view"});
  for(const mode of ["details","tiles","content"]){
    await view.selectOption(mode);
    await expect(view).toHaveValue(mode);
    await item.click();
    // A changed view creates new source item instances, never a second tap
    // on the previous view. Keep the actual fast sequence in this test.
    await expect(page.locator('[data-test-window="notepad"]')).toHaveCount(0);
    await expect(item).toHaveClass(/is-selected/);
    await expect(item).toHaveCSS("background-color","rgba(0, 0, 0, 0)");
    await expect.poll(()=>item.evaluate(el=>getComputedStyle(el,"::before").opacity)).toBe("0.7");
    await expect.poll(()=>item.evaluate(el=>getComputedStyle(el,"::before").backgroundImage)).toMatch(/linear-gradient/);
  }
  await expect(win.locator(".explorer-status")).toHaveCSS("background-color","rgb(42, 46, 50)");
  await win.locator('[data-source-window-control="close"]').click();
  await page.locator('[data-test-desktop-icon="bin"]').dblclick();
  const bin=page.locator('[data-test-window="bin"]').first();
  await expect(bin.locator(".explorer-address")).toHaveCSS("background-color","rgb(42, 46, 50)");
  await expect(bin.locator(".explorer-navigation")).toHaveCSS("background-color","rgb(42, 46, 50)");
});
test("Oxygen Notepad source menubar retains real View action",async({page})=>{
  await page.goto("/?theme=oxygen");
  await page.locator('[data-test-source-logon-avatar="oxygen"]').click({timeout:12000});
  await page.locator("[data-test-start-button]").click();
  const launcher=page.locator("[data-test-oxygen-start]");
  await launcher.locator("[data-test-start-search]").fill("Notepad");
  await launcher.locator('[data-test-start-group="apps"] [data-test-program="notepad"]').click();
  const win=page.locator('[data-test-window="notepad"]').first();
  const bar=win.locator(".notepad-menu");
  await expect(bar).toHaveCSS("background-color","rgb(42, 46, 50)");
  const initial=await win.locator(".notepad-status").count();
  await bar.getByRole("button",{name:"View",exact:true}).click();
  const menu=bar.locator(".notepad-menu__dropdown");
  await expect(menu).toBeVisible();
  await menu.getByRole("button",{name:/Status Bar/}).click();
  await expect(menu).toHaveCount(0);
  await expect(win.locator(".notepad-status")).toHaveCount(initial?0:1);
});
