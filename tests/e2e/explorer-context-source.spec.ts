import {expect,test,type Page} from "@playwright/test";

async function openFolder(page:Page,app:"computer"|"bin"){
  await page.goto("/?theme=win7");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.locator('[data-test-desktop-icon="'+app+'"]').dblclick();
  const win=page.locator('[data-test-window="'+app+'"]');
  await expect(win).toBeVisible();
  return win;
}
async function openBackgroundMenu(win:ReturnType<Page["locator"]>){
  const listing=win.locator(".explorer-content");
  await expect(listing).toBeVisible();
  const bounds=await listing.boundingBox();
  expect(bounds).not.toBeNull();
  await listing.click({button:"right",position:{
    x:Math.max(10,bounds!.width-12),
    y:Math.max(10,bounds!.height-12)
  }});
  const menu=win.locator('[data-test-explorer-context="background"]');
  await expect(menu).toBeVisible();
  return menu;
}
test("source Computer background View context uses shared eight mode contract",async({page})=>{
  const computer=await openFolder(page,"computer");
  const menu=await openBackgroundMenu(computer);
  await menu.locator("[data-test-explorer-context-view]").click();
  const modes=menu.getByRole("menuitemradio");
  await expect(modes).toHaveCount(8);
  await expect(modes).toHaveText([
    /Extra large icons/,/Large icons/,/Medium icons/,/Small icons/,
    /List/,/Details/,/Tiles/,/Content/
  ]);
  await expect(menu.locator('[data-test-explorer-context-mode="tiles"]'))
    .toHaveAttribute("aria-checked","true");
  await menu.locator('[data-test-explorer-context-mode="extra-large-icons"]').click();
  await expect(computer.locator(".explorer-list")).toHaveClass(/is-extra/);
  await expect(menu).toHaveCount(0);
});
test("final source Computer hides Copy Path, uploads Guest files and guards Map Directory",async({page})=>{
  const computer=await openFolder(page,"computer");
  const menu=await openBackgroundMenu(computer);
  await expect(menu.locator("[data-test-explorer-context-copy-path]")).toHaveCount(0);
  await expect(menu.locator("[data-test-explorer-context-map-directory]")).toBeDisabled();
  await expect(menu.locator("[data-test-explorer-context-upload]")).toBeEnabled();
  await expect(menu.locator("[data-test-explorer-context-upload]")).toHaveText("Upload Files");
  await menu.locator("[data-test-explorer-context-upload]").click();
  await computer.locator('input[type="file"][aria-label="Upload files"]')
    .setInputFiles({name:"Explorer Context Note.txt",mimeType:"text/plain",
      buffer:Buffer.from("Original Explorer source context")});
  await expect(computer.locator('[data-test-explorer-item="Explorer Context Note.txt"]'))
    .toBeVisible();
});
test("final source Bin context retains View but hides Copy Path and forbids upload and paste",async({page})=>{
  const bin=await openFolder(page,"bin");
  const menu=await openBackgroundMenu(bin);
  await expect(menu.locator("[data-test-explorer-context-copy-path]")).toHaveCount(0);
  await expect(menu.locator("[data-test-explorer-context-map-directory]")).toBeDisabled();
  await expect(menu.locator("[data-test-explorer-context-upload]")).toBeDisabled();
  await expect(menu.getByRole("menuitem",{name:"Paste"})).toHaveCount(0);
  await expect(menu.getByRole("menuitem",{name:"New folder"})).toHaveCount(0);
  await expect(menu.getByRole("menuitem",{name:"Empty Recycle Bin"})).toBeDisabled();
  await menu.locator("[data-test-explorer-context-view]").click();
  await expect(menu.getByRole("menuitemradio")).toHaveCount(8);
  await expect(menu).toBeVisible();
});

test("pinned Computer New submenu creates source folder, TXT and RTF in Guest VFS",async({page})=>{
  const computer=await openFolder(page,"computer");
  const expected=[
    ["folder","New folder"],
    ["richtext","New Rich Text Document.rtf"],
    ["text","New Text Document.txt"]
  ] as const;
  for(const [kind,filename] of expected){
    const menu=await openBackgroundMenu(computer);
    await menu.locator("[data-test-explorer-context-new]").click();
    await expect(menu.locator("[data-test-explorer-context-new-kind]")).toHaveText([
      "Folder","Rich Text Document","Text Document"
    ]);
    await menu.locator('[data-test-explorer-context-new-kind="'+kind+'"]').click();
    const item=computer.locator('[data-test-explorer-item="'+filename+'"]');
    await expect(item).toBeVisible();
    // Win7 source offers immediate inline rename on created items.
    const editor=item.locator("[data-test-source-listview-rename]");
    if(await editor.count())await editor.press("Enter");
    await expect(item).toBeVisible();
  }
  const paths=await page.evaluate(()=>{
    const raw=JSON.parse(localStorage.getItem("windows-os:vfs:guest:v1")||"{}") as {
      entries:{uri:string;content?:string;type:string}[]
    };
    return raw.entries.filter(entry=>entry.uri.includes("New ")).map(entry=>({
      uri:entry.uri,content:entry.content
    }));
  });
  expect(paths.some(p=>p.uri.endsWith("/New folder"))).toBe(true);
  expect(paths.some(p=>p.uri.endsWith("/New Rich Text Document.rtf")&&
    p.content?.startsWith("{\\rtf1\\ansi"))).toBe(true);
  expect(paths.some(p=>p.uri.endsWith("/New Text Document.txt")&&p.content===""))
    .toBe(true);
});

test("source Computer View child opens sideways with stable parent, bounds and keyboard",async({page})=>{
  const computer=await openFolder(page,"computer");
  const menu=await openBackgroundMenu(computer);
  const before=await menu.boundingBox();
  expect(before).not.toBeNull();
  const view=menu.locator("[data-test-explorer-context-view]");
  await view.focus();
  await view.press("ArrowRight");
  const child=menu.locator("[data-test-explorer-background-submenu]");
  await expect(child).toBeVisible();
  await expect(child).toHaveAttribute("aria-label","View");
  await expect(child).toHaveAttribute("data-side",/^(right|left)$/);
  await expect(child.getByRole("menuitemradio")).toHaveCount(8);
  const after=await menu.boundingBox();
  expect(after).not.toBeNull();
  expect(Math.abs(after!.height-before!.height)).toBeLessThan(2);
  const bounds=await child.boundingBox();
  expect(bounds).not.toBeNull();
  const viewport=page.viewportSize()!;
  expect(bounds!.x).toBeGreaterThanOrEqual(-1);
  expect(bounds!.y).toBeGreaterThanOrEqual(-1);
  expect(bounds!.x+bounds!.width).toBeLessThanOrEqual(viewport.width+1);
  expect(bounds!.y+bounds!.height).toBeLessThanOrEqual(viewport.height+1);
  const selected=child.locator('[data-test-explorer-context-mode="tiles"]');
  await expect(selected).toHaveAttribute("aria-checked","true");
  // Keyboard focus never leaks from this child into the parent main menu.
  const first=child.locator('[data-test-explorer-context-mode="extra-large-icons"]');
  await expect(first).toBeFocused();
  await first.press("ArrowDown");
  await expect(child.locator('[data-test-explorer-context-mode="large-icons"]'))
    .toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(child).toHaveCount(0);
  await expect(view).toBeFocused();
  await view.click();
  await menu.locator('[data-test-explorer-context-mode="extra-large-icons"]').click();
  await expect(computer.locator(".explorer-list")).toHaveClass(/is-extra/);
});
test("source Computer New side popup creates a real file; Bin lacks New",async({page})=>{
  const computer=await openFolder(page,"computer");
  const menu=await openBackgroundMenu(computer);
  const before=await menu.boundingBox();
  const create=menu.locator("[data-test-explorer-context-new]");
  await create.focus();
  await create.press("ArrowRight");
  const child=menu.locator("[data-test-explorer-background-submenu]");
  await expect(child).toHaveAttribute("aria-label","New");
  await expect(child.getByRole("menuitem")).toHaveText([
    "Folder","Rich Text Document","Text Document"
  ]);
  await expect(child.locator('[data-test-explorer-context-new-kind="folder"]'))
    .toBeFocused();
  const after=await menu.boundingBox();
  expect(after).not.toBeNull();
  expect(Math.abs(after!.height-before!.height)).toBeLessThan(2);
  await child.locator('[data-test-explorer-context-new-kind="text"]').click();
  await expect(computer.locator('[data-test-explorer-item="New Text Document.txt"]'))
    .toBeVisible();
  await expect(menu).toHaveCount(0);
  await computer.getByRole("button",{name:/^Close /}).click();
  await page.locator('[data-test-desktop-icon="bin"]').dblclick();
  const bin=page.locator('[data-test-window="bin"]');
  const binMenu=await openBackgroundMenu(bin);
  await expect(binMenu.locator("[data-test-explorer-context-new]")).toHaveCount(0);
  const view=binMenu.locator("[data-test-explorer-context-view]");
  await view.click();
  await expect(binMenu.locator("[data-test-explorer-background-submenu]"))
    .toHaveAttribute("aria-label","View");
  await expect(binMenu.getByRole("menuitemradio")).toHaveCount(8);
});
