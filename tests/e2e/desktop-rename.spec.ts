import {expect,test,type Locator,type Page} from "@playwright/test";

const DESKTOP="/EXTERNAL/computer/drive0/Users/Guest/Desktop";
async function guestExplorer(page:Page):Promise<Locator> {
  await page.goto("/");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const explorer=page.locator('[data-test-window="computer"]').first();
  await explorer.getByRole("button",{name:"Desktop",exact:true}).click();
  await expect(explorer.getByRole("textbox",{name:"Folder address"})).toHaveValue(DESKTOP);
  return explorer;
}
async function createFolder(explorer:Locator,name:string) {
  await explorer.getByRole("button",{name:"New folder"}).click();
  const dialog=explorer.getByRole("dialog",{name:"New folder"});
  await dialog.getByRole("textbox",{name:"New folder name"}).fill(name);
  await dialog.getByRole("button",{name:"OK"}).click();
  await expect(explorer.locator('[data-test-explorer-item="'+name+'"]')).toBeVisible();
}

test("Desktop F2 rename keeps .txt file extension and Notepad content across reload",async({page})=>{
  const explorer=await guestExplorer(page);
  await explorer.locator('input[type="file"][aria-label="Upload files"]').setInputFiles({
    name:"Before.txt",mimeType:"text/plain",buffer:Buffer.from("Do not lose this text")
  });
  const icon=page.locator('[data-test-desktop-file="'+DESKTOP+'/Before.txt"]');
  await expect(icon).toBeVisible();
  await icon.click();
  await page.keyboard.press("F2");
  const input=page.locator('[data-test-desktop-rename]');
  await expect(input).toHaveValue("Before");
  await input.fill("After");
  await input.press("Enter");
  await expect(icon).toHaveCount(0);
  const renamed=page.locator('[data-test-desktop-file="'+DESKTOP+'/After.txt"]');
  await expect(renamed).toBeVisible();
  await expect(explorer.locator('[data-test-explorer-item="After.txt"]')).toBeVisible();
  await renamed.dblclick();
  await expect(page.locator('[data-test-window="notepad"] .cm-content'))
    .toContainText("Do not lose this text");
  await page.reload();
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await expect(page.locator('[data-test-desktop-file="'+DESKTOP+'/After.txt"]'))
    .toBeVisible();
});

test("Desktop context Rename preserves folder tree and manually saved icon coordinates",async({page})=>{
  const explorer=await guestExplorer(page);
  await createFolder(explorer,"Old Folder");
  await explorer.locator('[data-test-explorer-item="Old Folder"]').dblclick();
  await createFolder(explorer,"Inside");
  // In both desktop and mobile Playwright projects, test a real unobstructed
  // desktop drag at desktop width: a foreground Explorer intercepts pointer
  // events and a mobile viewport may clip a wide move.
  await explorer.getByRole("button",{name:/^Close /}).click();
  await expect(explorer).toHaveCount(0);
  await page.setViewportSize({width:1280,height:720});
  const old=page.locator('[data-test-desktop-file="'+DESKTOP+'/Old Folder"]');
  const box=await old.boundingBox();
  if (!box) throw Error("Old desktop folder missing");
  await page.mouse.move(box.x+20,box.y+20);
  await page.mouse.down();
  await page.mouse.move(box.x+140,box.y+40,{steps:6});
  await page.mouse.up();
  await expect(old).toHaveAttribute("data-test-desktop-x","120");
  await old.click({button:"right"});
  await page.locator('[data-test-desktop-menu]').getByRole("menuitem",{name:"Rename"}).click();
  const input=page.locator('[data-test-desktop-rename]');
  await expect(input).toHaveValue("Old Folder");
  await input.fill("New Folder");
  await input.press("Enter");
  const updated=page.locator('[data-test-desktop-file="'+DESKTOP+'/New Folder"]');
  await expect(updated).toBeVisible();
  await expect(updated).toHaveAttribute("data-test-desktop-x","120");
  await updated.dblclick();
  const folderWindow=page.locator('[data-test-window="computer"]').last();
  await expect(folderWindow.getByRole("textbox",{name:"Folder address"}))
    .toHaveValue(DESKTOP+"/New Folder");
  await expect(folderWindow.locator('[data-test-explorer-item="Inside"]')).toBeVisible();
});

test("Desktop Rename rejects reserved names and collisions without changing user files",async({page})=>{
  const explorer=await guestExplorer(page);
  await createFolder(explorer,"One");
  await createFolder(explorer,"Two");
  const first=page.locator('[data-test-desktop-file="'+DESKTOP+'/One"]');
  const editor=page.locator('[data-test-desktop-rename]');
  await first.click();
  await page.keyboard.press("F2");
  await expect(editor).toBeVisible();
  await editor.fill("two");
  await editor.press("Enter");
  await expect(page.locator('#desktop-icons [role="alert"]'))
    .toContainText("already exists");
  await expect(first).toBeVisible();
  await expect(explorer.locator('[data-test-explorer-item="Two"]')).toBeVisible();

  await first.click();
  await page.keyboard.press("F2");
  await editor.fill("CON");
  await editor.press("Enter");
  await expect(page.locator('#desktop-icons [role="alert"]'))
    .toContainText("Invalid desktop file name");
  await expect(first).toBeVisible();
});

test("Desktop Escape cancels a pending F2 edit without modifying stored VFS name",async({page})=>{
  const explorer=await guestExplorer(page);
  await createFolder(explorer,"Keep This");
  const item=page.locator('[data-test-desktop-file="'+DESKTOP+'/Keep This"]');
  await item.click();
  await page.keyboard.press("F2");
  const editor=page.locator('[data-test-desktop-rename]');
  await editor.fill("Discard This");
  await editor.press("Escape");
  await expect(editor).toHaveCount(0);
  await expect(item).toBeVisible();
  await expect(explorer.locator('[data-test-explorer-item="Keep This"]')).toBeVisible();
  await expect(page.locator('[data-test-desktop-file="'+DESKTOP+'/Discard This"]')).toHaveCount(0);
});
