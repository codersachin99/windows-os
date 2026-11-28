import {expect,test,type Page} from "@playwright/test";
async function login(page:Page){
  await page.goto("/");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await expect(page.locator('[data-test-main-screen]')).toBeVisible();
}
async function sourceAlt(page:Page,key:string){
  // Dispatch at the document so Chromium's own Alt+D address-bar shortcut
  // cannot intercept the simulator's original DOM keydown listener.
  await page.evaluate(letter=>{
    document.dispatchEvent(new KeyboardEvent("keydown",{
      key:letter,altKey:true,bubbles:true,cancelable:true
    }));
  },key);
}
test("original Alt+W toggles Start and Alt+E opens Computer",async({page})=>{
  await login(page);
  await sourceAlt(page,"w");
  await expect(page.locator("[data-test-start-menu]")).toBeVisible();
  await sourceAlt(page,"w");
  await expect(page.locator("[data-test-start-menu]")).toHaveCount(0);
  await sourceAlt(page,"e");
  await expect(page.locator('[data-test-window="computer"]')).toBeVisible();
});
test("original Alt+D minimizes all windows, Alt+R opens Run without host execution",async({page})=>{
  await login(page);
  await sourceAlt(page,"e");
  await expect(page.locator('[data-test-window="computer"]')).toBeVisible();
  await sourceAlt(page,"d");
  await expect(page.locator('[data-test-window="computer"]')).toHaveCount(0);
  await expect(page.getByRole("button",{name:"Switch to Computer"})).toBeVisible();
  await sourceAlt(page,"r");
  const run=page.locator('[data-test-window="run"]');
  await expect(run).toBeVisible();
  await expect(run.getByRole("textbox",{name:"Open:"})).toBeFocused();
});
test("original hotkey filter preserves editable Run input while allowing desktop keys",async({page})=>{
  await login(page);
  await sourceAlt(page,"r");
  const input=page.locator('[data-test-window="run"]').getByRole("textbox",{name:"Open:"});
  await input.fill("notepad");
  await input.evaluate(el=>el.dispatchEvent(new KeyboardEvent("keydown",{
    key:"e",altKey:true,bubbles:true,cancelable:true
  })));
  await expect(page.locator('[data-test-window="computer"]')).toHaveCount(0);
  await expect(input).toHaveValue("notepad");
  await input.evaluate(el=>el.dispatchEvent(new KeyboardEvent("keydown",{
    key:"w",altKey:true,bubbles:true,cancelable:true
  })));
  await expect(page.locator("[data-test-start-menu]")).toHaveCount(0);
});


test("original Alt+L opens Switch view without logging Guest off or dropping windows",async({page})=>{
  await login(page);
  await sourceAlt(page,"e");
  await expect(page.locator('[data-test-window="computer"]')).toBeVisible();
  await sourceAlt(page,"l");
  await expect(page.locator("[data-test-logon-screen]")).toBeVisible();
  await expect(page.locator('[data-test-window="computer"]')).toHaveCount(0);
  await page.locator('[data-test-avatar="win7"]').click();
  await expect(page.locator("[data-test-main-screen]")).toBeVisible();
  // Source Switch retains the old desktop session; this is not LOG_OFF.
  await expect(page.locator('[data-test-window="computer"]')).toBeVisible();
});
