import {expect,test,type Page} from "@playwright/test";

async function win31Explorer(page:Page){
  await page.goto("/?theme=win31");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await expect(page.locator('[data-test-main-screen]')).toHaveAttribute("data-theme","win31");
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const explorer=page.locator('[data-test-window="computer"]').first();
  await expect(explorer).toBeVisible();
  return explorer;
}

test("Win31 Computer uses source gray/black Explorer frames and selected tree navigation",async({page})=>{
  const explorer=await win31Explorer(page);
  const stage=explorer.locator('[data-test-explorer]');
  await expect(stage).toHaveCSS("background-color","rgb(192, 192, 192)");
  await expect(stage).toHaveCSS("font-weight","700");
  const address=stage.locator(".explorer-address");
  await expect(address).toHaveCSS("background-color","rgb(192, 192, 192)");
  await expect(address.locator(".explorer-address__location-wrapper"))
    .toHaveCSS("border-top-color","rgb(0, 0, 0)");
  const navigation=stage.locator(".explorer-navigation");
  await expect(navigation).toHaveCSS("background-color","rgb(192, 192, 192)");
  const desktopLink=navigation.getByRole("button",{name:"Desktop",exact:true});
  await desktopLink.click();
  await expect(desktopLink).toHaveAttribute("aria-current","location");
  await expect(desktopLink).toHaveCSS("background-color","rgb(8, 10, 189)");
  await expect(desktopLink).toHaveCSS("color","rgb(255, 255, 255)");
  await expect(stage.locator(".explorer-status"))
    .toHaveCSS("background-color","rgb(192, 192, 192)");
  await expect(stage.locator(".explorer-status"))
    .toHaveCSS("border-top-color","rgb(0, 0, 0)");
});

test("Win31 source file list has no hover wash and selects actual Guest files in blue",async({page})=>{
  const explorer=await win31Explorer(page);
  const stage=explorer.locator('[data-test-explorer]');
  await stage.locator(".explorer-navigation").getByRole("button",{name:"Desktop",exact:true}).click();
  const name="Win31 Original Listview Target.txt";
  await explorer.locator('input[type="file"][aria-label="Upload files"]')
    .setInputFiles({name,mimeType:"text/plain",buffer:Buffer.from("real Guest VFS content")});
  const item=stage.locator('[data-test-explorer-item="'+name+'"]');
  await expect(item).toBeVisible();
  await item.hover();
  await expect(item).toHaveCSS("background-color","rgba(0, 0, 0, 0)");
  await item.click();
  await expect(item).toHaveClass(/is-active/);
  await expect(item).toHaveCSS("background-color","rgb(8, 10, 189)");
  await expect(item).toHaveCSS("color","rgb(255, 255, 255)");
  const view=stage.getByRole("combobox",{name:"Explorer view"});
  await view.selectOption("details");
  const headers=stage.locator(".explorer-columns");
  await expect(headers).toBeVisible();
  await expect(headers).toHaveCSS("background-color","rgb(192, 192, 192)");
  await expect(headers).toHaveCSS("border-bottom-color","rgb(0, 0, 0)");
  await expect(headers.locator(".listview__header-column").first())
    .toHaveCSS("border-right-color","rgb(0, 0, 0)");
  await expect(item).toBeVisible();
});

test("Win31 Recycle Bin shares source Explorer list, menu and status styling",async({page})=>{
  await win31Explorer(page);
  await page.locator('[data-test-desktop-icon="bin"]').dblclick();
  const bin=page.locator('[data-test-window="bin"]').first();
  await expect(bin).toBeVisible();
  const stage=bin.locator('[data-test-explorer]');
  await expect(stage).toHaveCSS("background-color","rgb(192, 192, 192)");
  await expect(stage.locator(".explorer-navigation"))
    .toHaveCSS("background-color","rgb(192, 192, 192)");
  await expect(stage.locator(".explorer-status"))
    .toHaveCSS("border-top-color","rgb(0, 0, 0)");
  const content=stage.getByRole("region",{name:"Folder contents"});
  await content.click({button:"right",position:{x:20,y:20}});
  const menu=bin.locator('[data-test-explorer-context="background"]');
  await expect(menu).toBeVisible();
  await expect(menu).toHaveCSS("background-color","rgb(255, 255, 255)");
  await expect(menu).toHaveCSS("border-top-color","rgb(0, 0, 0)");
  await page.keyboard.press("Escape");
  await expect(menu).toHaveCount(0);
});
