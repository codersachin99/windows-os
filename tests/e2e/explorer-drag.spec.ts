import { expect, test, type Page, type Locator } from "@playwright/test";

async function guestExplorer(page: Page): Promise<Locator> {
  await page.goto("/");
  await page.locator('[data-test-avatar="win7"]').click({ timeout: 12000 });
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  return page.locator('[data-test-window="computer"]');
}
async function makeFolder(explorer: Locator, name: string): Promise<void> {
  await explorer.getByRole("button", { name: "New folder" }).click();
  const modal=explorer.getByRole("dialog",{name:"New folder"});
  await modal.getByRole("textbox",{name:"New folder name"}).fill(name);
  await modal.getByRole("button",{name:"OK"}).click();
  await expect(explorer.locator('[data-test-explorer-item="'+name+'"]')).toBeVisible();
}

test("source Explorer internal drag moves folders and contents, without affecting clipboard",async({page})=>{
  const explorer=await guestExplorer(page);
  await makeFolder(explorer,"DragSource");
  await makeFolder(explorer,"DragTarget");
  await explorer.locator('[data-test-explorer-item="DragSource"]').dblclick();
  await makeFolder(explorer,"Child");
  await explorer.getByRole("button",{name:"Back"}).click();
  const source=explorer.locator('[data-test-explorer-item="DragSource"]');
  const target=explorer.locator('[data-test-explorer-item="DragTarget"]');
  await source.dragTo(target);
  await expect(source).toHaveCount(0);
  await target.dblclick();
  await expect(explorer.locator('[data-test-explorer-item="DragSource"]')).toBeVisible();
  await explorer.locator('[data-test-explorer-item="DragSource"]').dblclick();
  await expect(explorer.locator('[data-test-explorer-item="Child"]')).toBeVisible();
});

test("Ctrl+drag copies an Explorer file, preserving original contents",async({page})=>{
  const explorer=await guestExplorer(page);
  await makeFolder(explorer,"CopySource");
  await makeFolder(explorer,"CopyTarget");
  await explorer.locator('[data-test-explorer-item="CopySource"]').click();
  await page.keyboard.down("Control");
  try {
    await explorer.locator('[data-test-explorer-item="CopySource"]')
      .dragTo(explorer.locator('[data-test-explorer-item="CopyTarget"]'));
  } finally { await page.keyboard.up("Control"); }
  await expect(explorer.locator('[data-test-explorer-item="CopySource"]')).toBeVisible();
  await explorer.locator('[data-test-explorer-item="CopyTarget"]').dblclick();
  await expect(explorer.locator('[data-test-explorer-item="CopySource"]')).toBeVisible();
});

test("Explorer Upload selects host files, saves UTF-8 text and preserves binary bytes",async({page})=>{
  const explorer=await guestExplorer(page);
  await explorer.locator('input[type="file"][aria-label="Upload files"]').setInputFiles([
    {name:"Dropped.txt",mimeType:"text/plain",buffer:Buffer.from("Saved by drag/upload")},
    {name:"pix.bin",mimeType:"application/octet-stream",buffer:Buffer.from([0,1,255,2])}
  ]);
  await expect(explorer.locator('[data-test-explorer-item="Dropped.txt"]')).toBeVisible();
  await expect(explorer.locator('[data-test-explorer-item="pix.bin"]')).toBeVisible();
  await explorer.locator('[data-test-explorer-item="Dropped.txt"]').dblclick();
  const note=page.locator('[data-test-window="notepad"]');
  await expect(note.locator(".cm-content")).toContainText("Saved by drag/upload");
  const bytes=await page.evaluate(()=>{
    const state=JSON.parse(localStorage.getItem("windows-os:vfs:guest:v1")!) as {
      entries:{uri:string;bytes?:string}[]
    };
    const file=state.entries.find(x=>x.uri==="/pix.bin");
    return file?.bytes ? Array.from(atob(file.bytes)).map(char=>char.charCodeAt(0)):null;
  });
  expect(bytes).toEqual([0,1,255,2]);
});

test("external file drag-and-drop targets a child folder and refuses overwrites",async({page})=>{
  const explorer=await guestExplorer(page);
  await makeFolder(explorer,"Incoming");
  const drop=async(name:string,contents:string)=>{
    await page.evaluate(({name,contents})=>{
      const target=document.querySelector('[data-test-explorer-item="Incoming"]');
      if(!target)throw Error("Missing target folder");
      const data=new DataTransfer();
      data.items.add(new File([contents],name,{type:"text/plain"}));
      target.dispatchEvent(new DragEvent("dragover",{dataTransfer:data,bubbles:true,cancelable:true}));
      target.dispatchEvent(new DragEvent("drop",{dataTransfer:data,bubbles:true,cancelable:true}));
    },{name,contents});
  };
  await drop("outside.txt","Original dropped file");
  await expect(explorer.locator('[data-test-explorer-item="Incoming"]')).toBeVisible();
  await drop("outside.txt","Overwriting attempt");
  await expect(explorer.getByRole("alert")).toContainText("Destination already exists");
  await explorer.locator('[data-test-explorer-item="Incoming"]').dblclick();
  await expect(explorer.locator('[data-test-explorer-item="outside.txt"]')).toBeVisible();
  await explorer.locator('[data-test-explorer-item="outside.txt"]').dblclick();
  await expect(page.locator('[data-test-window="notepad"] .cm-content'))
    .toContainText("Original dropped file");
});
