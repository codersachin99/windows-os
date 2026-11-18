import {expect,test,type Page} from "@playwright/test";

const PROFILE="/EXTERNAL/computer/drive0/Users/Guest";
const DESKTOP=PROFILE+"/Desktop";
async function documents(page:Page,theme:"win7"|"win11"="win7"){
  await page.goto("/?theme="+theme);
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const computer=page.locator('[data-test-window="computer"]');
  await expect(computer).toBeVisible();
  await computer.locator(".explorer-navigation__home")
    .filter({hasText:"Documents"}).click();
  await expect(computer.getByRole("textbox",{name:"Folder address"}))
    .toHaveValue(PROFILE+"/Documents");
  return computer;
}
async function sendToDesktop(computer:ReturnType<Page["locator"]>,filename:string){
  const entry=computer.locator('[data-test-explorer-item="'+filename+'"]');
  await expect(entry).toBeVisible();
  await entry.click({button:"right"});
  const menu=computer.locator('[data-test-explorer-context="item"]');
  await expect(menu).toBeVisible();
  await menu.locator('[data-test-explorer-item-send-to]').click();
  const option=menu.locator('[data-test-explorer-item-send-to-kind="desktop"]');
  await expect(option).toBeEnabled();
  await option.click();
  await expect(menu).toHaveCount(0);
}
test("Win7 Explorer Send to Desktop produces functional file path .lnk and persists",async({page})=>{
  const computer=await documents(page);
  await computer.locator('input[type="file"][aria-label="Upload files"]')
    .setInputFiles({name:"Source Letter.txt",mimeType:"text/plain",
      buffer:Buffer.from("Hello from path-backed shortcut")});
  await sendToDesktop(computer,"Source Letter.txt");
  const shortcut=page.locator('[data-test-desktop-file="'+
    DESKTOP+'/Source Letter - Shortcut.lnk"]');
  await expect(shortcut).toBeVisible();
  const stored=await page.evaluate((path)=>{
    const fs=JSON.parse(localStorage.getItem("windows-os:vfs:guest:v1")||"{}");
    return JSON.parse(fs.entries.find((item:{uri:string})=>item.uri===path).content);
  },DESKTOP+"/Source Letter - Shortcut.lnk");
  expect(stored).toEqual({
    exe:"text",icon:"text",path:PROFILE+"/Documents/Source Letter.txt"
  });
  await computer.getByRole("button",{name:/^Close /}).click();
  await shortcut.dblclick();
  await expect(page.locator('[data-test-window="notepad"] .cm-content'))
    .toContainText("Hello from path-backed shortcut");

  await page.reload();
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await expect(shortcut).toBeVisible();
  await shortcut.dblclick();
  await expect(page.locator('[data-test-window="notepad"] .cm-content'))
    .toContainText("Hello from path-backed shortcut");
});
test("Win11 Send to Desktop creates independent shortcuts for multi-selection",async({page})=>{
  const computer=await documents(page,"win11");
  await computer.locator('input[type="file"][aria-label="Upload files"]')
    .setInputFiles([
      {name:"Multi A.txt",mimeType:"text/plain",buffer:Buffer.from("alpha")},
      {name:"Multi B.txt",mimeType:"text/plain",buffer:Buffer.from("beta")}
    ]);
  const first=computer.locator('[data-test-explorer-item="Multi A.txt"]');
  const second=computer.locator('[data-test-explorer-item="Multi B.txt"]');
  await expect(first).toBeVisible();
  await expect(second).toBeVisible();
  await first.click();
  await second.click({modifiers:["Control"]});
  await sendToDesktop(computer,"Multi A.txt");
  await expect(page.locator('[data-test-desktop-file="'+
    DESKTOP+'/Multi A - Shortcut.lnk"]')).toBeVisible();
  await expect(page.locator('[data-test-desktop-file="'+
    DESKTOP+'/Multi B - Shortcut.lnk"]')).toBeVisible();
  await sendToDesktop(computer,"Multi A.txt");
  await expect(page.locator('[data-test-desktop-file="'+
    DESKTOP+'/Multi A - Shortcut (2).lnk"]')).toBeVisible();
  await expect(page.locator('[data-test-desktop-file="'+
    DESKTOP+'/Multi B - Shortcut (2).lnk"]')).toBeVisible();
});
test("Explorer path shortcut to a folder opens the same real Guest directory",async({page})=>{
  const computer=await documents(page);
  await computer.getByRole("button",{name:"New folder"}).click();
  const dialog=computer.getByRole("dialog",{name:"New folder"});
  await dialog.getByRole("textbox",{name:"New folder name"})
    .fill("Project Folder");
  await dialog.getByRole("button",{name:"OK"}).click();
  await sendToDesktop(computer,"Project Folder");
  const shortcut=page.locator('[data-test-desktop-file="'+
    DESKTOP+'/Project Folder - Shortcut.lnk"]');
  await expect(shortcut).toBeVisible();
  await computer.getByRole("button",{name:/^Close /}).click();
  await shortcut.dblclick();
  const explorer=page.locator('[data-test-window="computer"]');
  await expect(explorer.getByRole("textbox",{name:"Folder address"}))
    .toHaveValue(PROFILE+"/Documents/Project Folder");
});


test("mobile Explorer Send to submenu never covers its own trigger when sides cannot fit",async({page})=>{
  await page.setViewportSize({width:375,height:667});
  const computer=await documents(page);
  await computer.locator('input[type="file"][aria-label="Upload files"]')
    .setInputFiles({name:"Mobile Send To.txt",mimeType:"text/plain",
      buffer:Buffer.from("mobile source shortcut")});
  const item=computer.locator('[data-test-explorer-item="Mobile Send To.txt"]');
  await expect(item).toBeVisible();
  await item.click({button:"right"});
  const menu=computer.locator('[data-test-explorer-context="item"]');
  await expect(menu).toBeVisible();
  const trigger=menu.locator('[data-test-explorer-item-send-to]');
  // Pointer movement over the source row opens the child even before
  // click. The previous center-overlap made Playwright click hang 30s.
  await trigger.hover();
  const child=menu.locator('[data-test-explorer-sendto-submenu]');
  await expect(child).toBeVisible();
  const a=await trigger.boundingBox();
  const b=await child.boundingBox();
  expect(a).not.toBeNull();
  expect(b).not.toBeNull();
  // If the viewport cannot fit both side-by-side, a vertically stacked
  // menu must leave the full parent trigger pointer-interactable.
  expect(b!.y>=a!.y+a!.height-1||b!.y+b!.height<=a!.y+1
    ||b!.x>=a!.x+a!.width-1||b!.x+b!.width<=a!.x+1).toBe(true);
  await trigger.click();
  await expect(child).toBeVisible();
  await child.locator('[data-test-explorer-item-send-to-kind="desktop"]').click();
  const shortcut=page.locator('[data-test-desktop-file="'+
    DESKTOP+'/Mobile Send To - Shortcut.lnk"]');
  await expect(shortcut).toBeVisible();
});
