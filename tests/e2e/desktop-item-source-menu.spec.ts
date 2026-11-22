import {expect,test,type Page} from "@playwright/test";
const DESKTOP="/EXTERNAL/computer/drive0/Users/Guest/Desktop";

async function logon(page:Page){
  await page.goto("/?theme=win7");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await expect(page.locator("#desktop-icons")).toBeVisible();
}
async function rightClick(page:Page,selector:string){
  const icon=page.locator(selector);
  await expect(icon).toBeVisible();
  await icon.click({button:"right"});
  const menu=page.locator('[data-test-desktop-menu]');
  await expect(menu).toBeVisible();
  return menu;
}
async function makeText(page:Page){
  const desktop=page.locator("#desktop-icons");
  await desktop.click({button:"right",position:{x:270,y:230}});
  const menu=page.locator('[data-test-desktop-menu]');
  await menu.getByRole("menuitem",{name:/New/}).click();
  await menu.getByRole("menuitem",{name:"Text Document",exact:true}).click();
  const rename=page.locator('[data-test-desktop-rename]');
  await expect(rename).toHaveValue("New Text Document");
  await rename.press("Enter");
  const icon=page.locator('[data-test-desktop-file="'+
    DESKTOP+'/New Text Document.txt"]');
  await expect(icon).toBeVisible();
  return icon;
}

test("source Desktop system item menu exposes functional Pin and Bin state",async({page})=>{
  await logon(page);
  let menu=await rightClick(page,'[data-test-desktop-icon="computer"]');
  await expect(menu.locator("[data-test-desktop-item-action]")).toHaveText([
    "Open","Pin to taskbar","Properties"
  ]);
  await expect(menu.locator('[data-test-desktop-item-action="pin"]')).toBeEnabled();
  await expect(menu.locator('[data-test-desktop-item-action="properties"]')).toBeDisabled();
  await page.keyboard.press("Escape");
  menu=await rightClick(page,'[data-test-desktop-icon="bin"]');
  await expect(menu.locator("[data-test-desktop-item-action]")).toHaveText([
    "Open","Empty Recycle Bin","Pin to taskbar","Properties"
  ]);
  await expect(menu.locator('[data-test-desktop-item-action="empty-bin"]'))
    .toBeDisabled();
});

test("source Desktop file menu can download exact Guest bytes and safely empty Bin",async({page})=>{
  await logon(page);
  const file=await makeText(page);
  let menu=await rightClick(page,'[data-test-desktop-file="'+
    DESKTOP+'/New Text Document.txt"]');
  await expect(menu.locator("[data-test-desktop-item-action]")).toHaveText([
    "Open","Send to ▸","Download","Cut","Copy","Delete","Rename","Properties"
  ]);
  await expect(menu.locator('[data-test-desktop-item-action="send-to"]')).toBeEnabled();
  const downloadEvent=page.waitForEvent("download");
  await menu.locator('[data-test-desktop-item-action="download"]').click();
  const download=await downloadEvent;
  expect(download.suggestedFilename()).toBe("New Text Document.txt");
  // Delete is always reversible into source trash until explicit Empty Bin.
  menu=await rightClick(page,'[data-test-desktop-file="'+
    DESKTOP+'/New Text Document.txt"]');
  await menu.locator('[data-test-desktop-item-action="delete"]').click();
  const deleteDialog=page.getByRole("alertdialog",{name:"Confirm desktop deletion"});
  await deleteDialog.getByRole("button",{name:"Yes"}).click();
  await expect(file).toHaveCount(0);
  menu=await rightClick(page,'[data-test-desktop-icon="bin"]');
  await expect(menu.locator('[data-test-desktop-item-action="empty-bin"]'))
    .toBeEnabled();
  await menu.locator('[data-test-desktop-item-action="empty-bin"]').click();
  const empty=page.getByRole("alertdialog",{name:"Confirm empty Recycle Bin"});
  await expect(empty).toContainText("Permanently delete all 1 item");
  await empty.getByRole("button",{name:"No"}).click();
  menu=await rightClick(page,'[data-test-desktop-icon="bin"]');
  await menu.locator('[data-test-desktop-item-action="empty-bin"]').click();
  await empty.getByRole("button",{name:"Yes"}).click();
  menu=await rightClick(page,'[data-test-desktop-icon="bin"]');
  await expect(menu.locator('[data-test-desktop-item-action="empty-bin"]'))
    .toBeDisabled();
  await page.keyboard.press("Escape");
  await page.locator('[data-test-desktop-icon="bin"]').dblclick();
  const bin=page.locator('[data-test-window="bin"]');
  await expect(bin.locator('[data-test-explorer-item="New Text Document.txt"]'))
    .toHaveCount(0);
});

test("source Desktop menu counts selected Guest paths, not Computer and other system icons",async({page})=>{
  await logon(page);
  await makeText(page);
  const text=page.locator('[data-test-desktop-file="'+
    DESKTOP+'/New Text Document.txt"]');
  await text.click();
  await page.locator('[data-test-desktop-icon="computer"]')
    .click({modifiers:["Control"]});
  await expect(text).toHaveAttribute("data-test-desktop-selected","true");
  await expect(page.locator('[data-test-desktop-icon="computer"]'))
    .toHaveAttribute("data-test-desktop-selected","true");
  let menu=await rightClick(page,'[data-test-desktop-file="'+
    DESKTOP+'/New Text Document.txt"]');
  // Frozen DesktopItemMenu.isMultiple is this.paths.length > 1; Computer
  // has no real shortcut.path and MUST NOT hide the single-path actions.
  await expect(menu.locator('[data-test-desktop-item-action="open"]')).toBeVisible();
  await expect(menu.locator('[data-test-desktop-item-action="rename"]')).toBeVisible();
  await expect(menu.locator('[data-test-desktop-item-action="delete"]'))
    .toBeEnabled();
  await page.keyboard.press("Escape");

  // Two actual Guest file paths DO form a source multiple selection.
  await page.locator('[data-test-desktop-upload-input]').setInputFiles({
    name:"Second Selected Data.txt",mimeType:"text/plain",buffer:Buffer.from("second")
  });
  const second=page.locator('[data-test-desktop-file="'+
    DESKTOP+'/Second Selected Data.txt"]');
  await expect(second).toBeVisible();
  await text.click();
  await second.click({modifiers:["Control"]});
  await page.locator('[data-test-desktop-icon="computer"]')
    .click({modifiers:["Control"]});
  await expect(text).toHaveAttribute("data-test-desktop-selected","true");
  await expect(second).toHaveAttribute("data-test-desktop-selected","true");
  menu=await rightClick(page,'[data-test-desktop-file="'+
    DESKTOP+'/New Text Document.txt"]');
  await expect(menu.locator('[data-test-desktop-item-action="open"]')).toHaveCount(0);
  await expect(menu.locator('[data-test-desktop-item-action="rename"]')).toHaveCount(0);
  await expect(menu.locator('[data-test-desktop-item-action="delete"]'))
    .toBeEnabled();
});

test("source Desktop Pin/Unpin places persistent launcher in the real taskbar",async({page})=>{
  await logon(page);
  let menu=await rightClick(page,'[data-test-desktop-icon="computer"]');
  await expect(menu.locator('[data-test-desktop-item-action="pin"]')).toHaveText(
    "Pin to taskbar");
  await menu.locator('[data-test-desktop-item-action="pin"]').click();
  const pin=page.locator('[data-test-taskbar-pin="computer"]');
  await expect(pin).toBeVisible();
  await pin.click();
  await expect(page.locator('[data-test-window="computer"]')).toBeVisible();
  await expect(pin).toHaveAttribute("data-test-taskbar-pin-running","true");
  menu=await rightClick(page,'[data-test-desktop-icon="computer"]');
  await expect(menu.locator('[data-test-desktop-item-action="pin"]')).toHaveText(
    "Unpin from taskbar");
  await page.reload();
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await expect(page.locator('[data-test-taskbar-pin="computer"]')).toBeVisible();
  menu=await rightClick(page,'[data-test-desktop-icon="computer"]');
  await menu.locator('[data-test-desktop-item-action="pin"]').click();
  await expect(page.locator('[data-test-taskbar-pin="computer"]')).toHaveCount(0);
});
