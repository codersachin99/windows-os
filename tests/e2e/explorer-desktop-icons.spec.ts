import { expect, test, type Page, type Locator } from "@playwright/test";

const desktop="/EXTERNAL/computer/drive0/Users/Guest/Desktop";
const documents="/EXTERNAL/computer/drive0/Users/Guest/Documents";

async function login(page:Page) {
  await page.goto("/");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await expect(page.locator("#desktop-icons")).toBeVisible();
}
async function createDesktopFolder(page:Page,name:string) {
  await page.locator("#desktop-icons").click({button:"right",position:{x:285,y:290}});
  const menu=page.locator("[data-test-desktop-menu]");
  await menu.getByRole("menuitem",{name:/^New/}).click();
  await menu.getByRole("menuitem",{name:"Folder",exact:true}).click();
  const editor=page.locator("[data-test-desktop-rename]");
  await editor.fill(name); await editor.press("Enter");
  const icon=page.locator('[data-test-desktop-file="'+desktop+"/"+name+'"]');
  await expect(icon).toBeVisible();
  return icon;
}
async function openDocuments(page:Page) {
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const explorer=page.locator('[data-test-window="computer"]').last();
  await explorer.getByRole("button",{name:"Documents",exact:true}).click();
  await expect(explorer.getByRole("textbox",{name:"Folder address"})).toHaveValue(documents);
  return explorer;
}
async function makeFolder(explorer:Locator,name:string) {
  await explorer.getByRole("button",{name:"New folder"}).click();
  const dialog=explorer.getByRole("dialog",{name:"New folder"});
  await dialog.getByRole("textbox",{name:"New folder name"}).fill(name);
  await dialog.getByRole("button",{name:"OK"}).click();
  const row=explorer.locator('[data-test-explorer-item="'+name+'"]');
  await expect(row).toBeVisible();
  return row;
}

test("Explorer folder moves into a real Desktop folder icon and survives reload",async({page})=>{
  await login(page);
  const receiver=await createDesktopFolder(page,"Receiving Folder");
  const explorer=await openDocuments(page);
  const folder=await makeFolder(explorer,"Inside Receiver");
  await folder.dragTo(receiver);
  await expect(folder).toHaveCount(0);
  await receiver.dblclick();
  const child=page.locator('[data-test-window="computer"]').last();
  await expect(child.getByRole("textbox",{name:"Folder address"}))
    .toHaveValue(desktop+"/Receiving Folder");
  await expect(child.locator('[data-test-explorer-item="Inside Receiver"]')).toBeVisible();
  await page.reload();
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  const after=page.locator('[data-test-desktop-file="'+desktop+'/Receiving Folder"]');
  await expect(after).toBeVisible();
  await after.dblclick();
  await expect(page.locator('[data-test-window="computer"]').last()
    .locator('[data-test-explorer-item="Inside Receiver"]')).toBeVisible();
});

test("Ctrl-drag to a Desktop folder copies and refuses duplicate folder names",async({page})=>{
  await login(page);
  const receiver=await createDesktopFolder(page,"Copy Receiver");
  const explorer=await openDocuments(page);
  const folder=await makeFolder(explorer,"Copy Through Icon");
  await folder.click();
  await page.keyboard.down("Control");
  try { await folder.dragTo(receiver); }
  finally { await page.keyboard.up("Control"); }
  await expect(folder).toBeVisible();
  await receiver.dblclick();
  const child=page.locator('[data-test-window="computer"]').last();
  await expect(child.locator('[data-test-explorer-item="Copy Through Icon"]')).toBeVisible();
  // The original Documents window stays open beneath the newly opened folder;
  // try the same copy again. The existing file must never be overwritten.
  await page.locator('[data-test-window="computer"]').last()
    .getByRole("button",{name:/^Close /}).click();
  await page.keyboard.down("Control");
  try { await folder.dragTo(receiver); }
  finally { await page.keyboard.up("Control"); }
  await expect(page.locator("#desktop-icons [role=alert]"))
    .toContainText("Destination already exists");
  await expect(folder).toBeVisible();
});

test("Explorer selected group recycles atomically via the built-in Desktop Bin icon",async({page})=>{
  await login(page);
  const explorer=await openDocuments(page);
  const a=await makeFolder(explorer,"Bin Group One");
  const b=await makeFolder(explorer,"Bin Group Two");
  await a.click(); await b.click({modifiers:["Control"]});
  await b.dragTo(page.locator('[data-test-desktop-icon="bin"]'));
  await expect(a).toHaveCount(0);
  await expect(b).toHaveCount(0);
  await page.locator('[data-test-desktop-icon="bin"]').dblclick();
  const bin=page.locator('[data-test-window="bin"]').last();
  await expect(bin.locator('[data-test-explorer-item="Bin Group One"]')).toBeVisible();
  await expect(bin.locator('[data-test-explorer-item="Bin Group Two"]')).toBeVisible();
  await bin.locator('[data-test-explorer-item="Bin Group One"]').click();
  await bin.getByRole("button",{name:"Restore",exact:true}).click();
  await expect(explorer.locator('[data-test-explorer-item="Bin Group One"]')).toBeVisible();
});

test("browser File drop can import into Desktop folder but cannot inject fake Bin entries",async({page})=>{
  await login(page);
  const receiver=await createDesktopFolder(page,"Host Receiver");
  const dragToIcon=async(icon:string,name:string,contents:string) => {
    await page.evaluate(({icon,name,contents})=>{
      const target=document.querySelector(icon);
      if(!target)throw Error("Missing native desktop drop target");
      const dt=new DataTransfer();
      dt.items.add(new File([contents],name,{type:"text/plain"}));
      target.dispatchEvent(new DragEvent("dragover",{dataTransfer:dt,bubbles:true,cancelable:true}));
      target.dispatchEvent(new DragEvent("drop",{dataTransfer:dt,bubbles:true,cancelable:true}));
    },{icon,name,contents});
  };
  const target='[data-test-desktop-file="'+desktop+'/Host Receiver"]';
  await dragToIcon(target,"Upload into Folder.txt","Safe Guest file");
  await dragToIcon('[data-test-desktop-icon="bin"]',"Fake Recycled.txt","Untrusted host payload");
  await receiver.dblclick();
  const explorer=page.locator('[data-test-window="computer"]').last();
  await expect(explorer.locator('[data-test-explorer-item="Upload into Folder.txt"]')).toBeVisible();
  await expect(page.locator('[data-test-desktop-file="'+desktop+'/Fake Recycled.txt"]')).toHaveCount(0);
  await page.locator('[data-test-desktop-icon="bin"]').dblclick();
  const bin=page.locator('[data-test-window="bin"]').last();
  await expect(bin.locator('[data-test-explorer-item="Fake Recycled.txt"]')).toHaveCount(0);
});
