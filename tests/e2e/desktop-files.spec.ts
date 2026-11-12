import { expect, test, type Locator, type Page } from "@playwright/test";

const DESKTOP="/EXTERNAL/computer/drive0/Users/Guest/Desktop";
async function startGuest(page: Page): Promise<Locator> {
  await page.goto("/");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const explorer=page.locator('[data-test-window="computer"]').first();
  await explorer.getByRole("button",{name:"Desktop",exact:true}).click();
  await expect(explorer.getByRole("textbox",{name:"Folder address"})).toHaveValue(DESKTOP);
  return explorer;
}
async function newFolder(explorer:Locator,name:string) {
  await explorer.getByRole("button",{name:"New folder"}).click();
  const dialog=explorer.getByRole("dialog",{name:"New folder"});
  await dialog.getByRole("textbox",{name:"New folder name"}).fill(name);
  await dialog.getByRole("button",{name:"OK"}).click();
}

test("Guest Desktop folders appear as live file-backed icons and open Explorer at folder path",async({page})=>{
  const explorer=await startGuest(page);
  await newFolder(explorer,"Desktop Projects");
  const icon=page.locator('[data-test-desktop-file="'+DESKTOP+'/Desktop Projects"]');
  await expect(icon).toBeVisible();
  await expect(icon).toContainText("Desktop Projects");
  await icon.dblclick();
  const next=page.locator('[data-test-window="computer"]').last();
  await expect(page.locator('[data-test-window="computer"]')).toHaveCount(2);
  await expect(next.getByRole("textbox",{name:"Folder address"}))
    .toHaveValue(DESKTOP+"/Desktop Projects");
});

test("source Guest Desktop TXT file opens in native Notepad and remains after reload",async({page})=>{
  const explorer=await startGuest(page);
  await explorer.locator('input[type="file"][aria-label="Upload files"]').setInputFiles({
    name:"Desktop Notes.txt",mimeType:"text/plain",
    buffer:Buffer.from("Saved to the original Guest Desktop directory")
  });
  const icon=page.locator('[data-test-desktop-file="'+DESKTOP+'/Desktop Notes.txt"]');
  await expect(icon).toBeVisible();
  await icon.dblclick();
  await expect(page.locator('[data-test-window="notepad"] .cm-content'))
    .toContainText("Saved to the original Guest Desktop directory");
  await page.reload();
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await expect(page.locator('[data-test-desktop-file="'+DESKTOP+'/Desktop Notes.txt"]'))
    .toBeVisible();
});

test("imported source JSON .lnk shortcut resolves known Calculator executable",async({page})=>{
  const explorer=await startGuest(page);
  await explorer.locator('input[type="file"][aria-label="Upload files"]').setInputFiles({
    name:"Calculator.lnk",mimeType:"application/octet-stream",
    buffer:Buffer.from('{"exe":"calc","icon":"calc"}')
  });
  const icon=page.locator('[data-test-desktop-file="'+DESKTOP+'/Calculator.lnk"]');
  await expect(icon).toBeVisible();
  await expect(icon).toContainText("Calculator");
  await icon.dblclick();
  const calc=page.locator('[data-test-window="calc"]');
  await expect(calc.locator('[data-test-calculator]')).toBeVisible();
  await calc.locator('[data-test-calc-button="7"]').click();
  await calc.locator('[data-test-calc-button="*"]').click();
  await calc.locator('[data-test-calc-button="6"]').click();
  await calc.locator('[data-test-calc-button="="]').click();
  await expect(calc.locator('[data-test-result-input]')).toHaveValue("42");
});

test("Guest file shortcut Delete uses the mounted source Recycle Bin",async({page})=>{
  const explorer=await startGuest(page);
  await newFolder(explorer,"Recycle Me");
  const icon=page.locator('[data-test-desktop-file="'+DESKTOP+'/Recycle Me"]');
  await expect(icon).toBeVisible();
  await icon.click({button:"right"});
  const menu=page.locator('[data-test-desktop-menu]');
  await menu.getByRole("menuitem",{name:"Delete"}).click();
  const confirmation=page.getByRole("alertdialog",{name:"Confirm desktop deletion"});
  await expect(confirmation).toBeVisible();
  await confirmation.getByRole("button",{name:"Yes"}).click();
  await expect(icon).toHaveCount(0);
  await page.locator('[data-test-desktop-icon="bin"]').dblclick();
  const bin=page.locator('[data-test-window="bin"]');
  await expect(bin.locator('[data-test-explorer-item="Recycle Me"]')).toBeVisible();
});

test("malformed host .lnk is displayed but never executed as an arbitrary program",async({page})=>{
  const explorer=await startGuest(page);
  await explorer.locator('input[type="file"][aria-label="Upload files"]').setInputFiles({
    name:"Unsafe.lnk",mimeType:"application/octet-stream",
    buffer:Buffer.from('{"exe":"random-shell-command","icon":"cmd"}')
  });
  const icon=page.locator('[data-test-desktop-file="'+DESKTOP+'/Unsafe.lnk"]');
  await expect(icon).toBeVisible();
  await icon.dblclick();
  await expect(page.locator('#desktop-icons [role="alert"]'))
    .toContainText("No original application association");
  await expect(page.locator('[data-test-window="cmd"]')).toHaveCount(0);
});
