import { expect, test, type Locator, type Page } from "@playwright/test";

const desktop = "/EXTERNAL/computer/drive0/Users/Guest/Desktop";
const documents = "/EXTERNAL/computer/drive0/Users/Guest/Documents";

async function login(page: Page) {
  await page.goto("/");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await expect(page.locator("#desktop-icons")).toBeVisible();
}
async function documentsExplorer(page: Page): Promise<Locator> {
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const win = page.locator('[data-test-window="computer"]').last();
  await win.getByRole("button",{name:"Documents",exact:true}).click();
  await expect(win.getByRole("textbox",{name:"Folder address"})).toHaveValue(documents);
  return win;
}
async function folder(win:Locator,name:string) {
  await win.getByRole("button",{name:"New folder"}).click();
  const form=win.getByRole("dialog",{name:"New folder"});
  await form.getByRole("textbox",{name:"New folder name"}).fill(name);
  await form.getByRole("button",{name:"OK"}).click();
  await expect(win.locator('[data-test-explorer-item="'+name+'"]')).toBeVisible();
}
async function desktopFolder(page:Page,name:string) {
  await page.locator("#desktop-icons").click({button:"right",position:{x:28,y:440}});
  const menu=page.locator("[data-test-desktop-menu]");
  await menu.getByRole("menuitem",{name:/^New/}).click();
  await menu.getByRole("menuitem",{name:"Folder",exact:true}).click();
  const editor=page.locator("[data-test-desktop-rename]");
  await editor.fill(name);
  await editor.press("Enter");
  return page.locator('[data-test-desktop-file="'+desktop+"/"+name+'"]');
}
async function dragToBackground(page:Page,source:Locator,copy=false) {
  const rect=await page.locator("#desktop-icons").boundingBox();
  if (!rect) throw new Error("Guest desktop is unavailable");
  const targetPosition={
    x: Math.min(27,rect.width/2),
    y: Math.min(Math.round(rect.height * .75),rect.height-65)
  };
  if(copy) await page.keyboard.down("Control");
  try {
    await source.dragTo(page.locator("#desktop-icons"),{targetPosition});
  } finally {
    if(copy) await page.keyboard.up("Control");
  }
}
test("native Explorer drag moves a Guest folder onto empty Desktop and persists it",async({page})=>{
  await login(page);
  const win=await documentsExplorer(page);
  await folder(win,"Inbox From Documents");
  const source=win.locator('[data-test-explorer-item="Inbox From Documents"]');
  await dragToBackground(page,source);
  const icon=page.locator('[data-test-desktop-file="'+desktop+'/Inbox From Documents"]');
  await expect(icon).toBeVisible();
  await expect(source).toHaveCount(0);
  await page.reload();
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await expect(icon).toBeVisible();
});

test("Ctrl-native drag copies instead of moving; existing Desktop names never overwrite",async({page})=>{
  await login(page);
  const win=await documentsExplorer(page);
  await folder(win,"Native Copy");
  const source=win.locator('[data-test-explorer-item="Native Copy"]');
  await source.click();
  await dragToBackground(page,source,true);
  const icon=page.locator('[data-test-desktop-file="'+desktop+'/Native Copy"]');
  await expect(icon).toBeVisible();
  await expect(source).toBeVisible();
  await dragToBackground(page,source,true);
  await expect(page.locator("#desktop-icons [role=alert]"))
    .toContainText("Destination already exists");
  await expect(icon).toBeVisible();
  await expect(source).toBeVisible();
});

test("selected Explorer group is moved to Desktop using one source session token",async({page})=>{
  await login(page);
  const win=await documentsExplorer(page);
  await folder(win,"Group Source A");
  await folder(win,"Group Source B");
  const a=win.locator('[data-test-explorer-item="Group Source A"]');
  const b=win.locator('[data-test-explorer-item="Group Source B"]');
  await a.click();
  await b.click({modifiers:["Control"]});
  await dragToBackground(page,b);
  await expect(page.locator('[data-test-desktop-file="'+desktop+'/Group Source A"]')).toBeVisible();
  await expect(page.locator('[data-test-desktop-file="'+desktop+'/Group Source B"]')).toBeVisible();
  await expect(a).toHaveCount(0);
  await expect(b).toHaveCount(0);
});

test("host File drop follows source desktop parser and rejects duplicate file imports",async({page})=>{
  await login(page);
  const drop=async(contents:string)=>{
    await page.evaluate(text=>{
      const target=document.querySelector("#desktop-icons");
      if(!target) throw Error("Desktop missing");
      const data=new DataTransfer();
      data.items.add(new File([text],"Desktop Import.txt",{type:"text/plain"}));
      target.dispatchEvent(new DragEvent("dragover",{dataTransfer:data,bubbles:true,cancelable:true}));
      target.dispatchEvent(new DragEvent("drop",{dataTransfer:data,bubbles:true,cancelable:true}));
    },contents);
  };
  await drop("Imported safely into Guest Desktop");
  const icon=page.locator('[data-test-desktop-file="'+desktop+'/Desktop Import.txt"]');
  await expect(icon).toBeVisible();
  await drop("Do not overwrite");
  await expect(page.locator("#desktop-icons [role=alert]")).toContainText("Destination already exists");
  await icon.dblclick();
  await expect(page.locator('[data-test-window="notepad"] .cm-content'))
    .toContainText("Imported safely into Guest Desktop");
});
