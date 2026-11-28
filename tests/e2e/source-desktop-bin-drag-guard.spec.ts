import {expect,test,type Locator,type Page} from "@playwright/test";

const PROFILE="/EXTERNAL/computer/drive0/Users/Guest";
const DESKTOP=PROFILE+"/Desktop";
const DOCUMENTS=PROFILE+"/Documents";

/**
 * The frozen main.js dropIcons repositions Desktop shortcuts rather than
 * trashing files. React retains a separate direct-Guest-icon drag-to-Bin
 * convenience. Guard that extra operation against accidental deletion of
 * file-backed .lnk JSON or real shortcut targets.
 */
async function login(page:Page){
  await page.goto("/?theme=win7");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await expect(page.locator("#desktop-icons")).toBeVisible();
}
async function dragOntoBin(page:Page,icon:Locator){
  const from=await icon.boundingBox();
  const to=await page.locator('[data-test-desktop-icon="bin"]').boundingBox();
  if(!from||!to)throw new Error("Desktop shortcut or Bin is not visible");
  await page.mouse.move(from.x+Math.min(19,from.width/3),
    from.y+Math.min(18,from.height/3));
  await page.mouse.down();
  await page.mouse.move(to.x+to.width/2,to.y+to.height/2,{steps:12});
  await page.mouse.up();
}
test("Desktop path-backed .lnk Bin drop preserves both shortcut and real Documents target",async({page})=>{
  await login(page);
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const win=page.locator('[data-test-window="computer"]').last();
  await win.locator(".explorer-navigation__home").filter({hasText:"Documents"}).click();
  await expect(win.getByRole("textbox",{name:"Folder address"})).toHaveValue(DOCUMENTS);
  await win.locator('input[type="file"][aria-label="Upload files"]').setInputFiles({
    name:"Do Not Drag Delete.txt",mimeType:"text/plain",
    buffer:Buffer.from("must remain in Documents")
  });
  const source=win.locator('[data-test-explorer-item="Do Not Drag Delete.txt"]');
  await expect(source).toBeVisible();
  await source.click({button:"right"});
  const menu=win.locator('[data-test-explorer-context="item"]');
  await menu.locator('[data-test-explorer-item-send-to]').click();
  await menu.locator('[data-test-explorer-item-send-to-kind="desktop"]').click();
  const link=page.locator('[data-test-desktop-file="'+DESKTOP+
    '/Do Not Drag Delete - Shortcut.lnk"]');
  await expect(link).toBeVisible();
  await win.getByRole("button",{name:/^Close /}).click();
  await dragOntoBin(page,link);
  await expect(page.locator('#desktop-icons [role="alert"]'))
    .toContainText("Only direct Guest Desktop items");
  await expect(link).toBeVisible();
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const fresh=page.locator('[data-test-window="computer"]').last();
  await fresh.locator(".explorer-navigation__home").filter({hasText:"Documents"}).click();
  await expect(fresh.locator('[data-test-explorer-item="Do Not Drag Delete.txt"]'))
    .toBeVisible();
  await fresh.getByRole("button",{name:/^Close /}).click();
  await page.locator('[data-test-desktop-icon="bin"]').dblclick();
  const bin=page.locator('[data-test-window="bin"]').last();
  await expect(bin.locator('[data-test-explorer-item="Do Not Drag Delete.txt"]'))
    .toHaveCount(0);
  await expect(bin.locator('[data-test-explorer-item="Do Not Drag Delete - Shortcut.lnk"]'))
    .toHaveCount(0);
});
test("Desktop program-only .lnk Bin drag cannot silently trash its shortcut JSON",async({page})=>{
  await login(page);
  await page.locator('[data-test-desktop-upload-input]').setInputFiles({
    name:"Program Drag Guard.lnk",mimeType:"application/json",
    buffer:Buffer.from('{"exe":"calc","icon":"calc"}')
  });
  const icon=page.locator('[data-test-desktop-file="'+DESKTOP+
    '/Program Drag Guard.lnk"]');
  await expect(icon).toBeVisible();
  await dragOntoBin(page,icon);
  await expect(page.locator('#desktop-icons [role="alert"]'))
    .toContainText("Only direct Guest Desktop items");
  await expect(icon).toBeVisible();
});
