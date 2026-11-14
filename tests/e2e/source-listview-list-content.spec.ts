import {expect,test,type Page} from "@playwright/test";

async function openComputer(page:Page){
  await page.goto("/?theme=win7");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const win=page.locator('[data-test-window="computer"]');
  await expect(win).toBeVisible();
  return win;
}
async function setSourceView(win:ReturnType<Page["locator"]>,name:"List"|"Content"){
  await win.getByRole("button",{name:"View",exact:true}).click();
  await win.getByRole("menu",{name:"View options"})
    .getByRole("menuitemradio",{name,exact:true}).click();
}
test("pinned source 00d7 List and 27b9 Content use shared layouts and live VFS extras",async({page})=>{
  const win=await openComputer(page);
  await win.getByRole("button",{name:"New folder"}).click();
  const prompt=win.getByRole("dialog",{name:"New folder"});
  await prompt.getByRole("textbox",{name:"New folder name"}).fill("SourceContentProbe");
  await prompt.getByRole("button",{name:"OK"}).click();
  const item=win.locator('[data-test-explorer-item="SourceContentProbe"]');
  await expect(item).toBeVisible();
  await setSourceView(win,"List");
  await expect(win.locator('[data-test-source-listview="list"]')).toHaveClass(/has-list/);
  await expect(item.locator(".listview__item-extra")).toHaveCount(0);
  await item.click();
  await expect(item).toHaveClass(/is-active/);
  await setSourceView(win,"Content");
  await expect(win.locator('[data-test-source-listview="content"]')).toHaveClass(/has-content/);
  const info=item.locator('[data-test-source-content-extras]');
  await expect(info).toBeVisible();
  // Original computer.js shows only the modified date for a Content folder.
  await expect(info.locator(".listview__item-extra")).toHaveCount(1);
  await expect(info.locator(".listview__item-extra").first()).toContainText("/");
  await expect(item).toHaveClass(/is-selected/);
  await item.dblclick();
  await expect(win.getByRole("textbox",{name:"Folder address"})).toHaveValue("/SourceContentProbe");
});

test("pinned Computer Content file extras use source date/type/size order",async({page})=>{
  const win=await openComputer(page);
  await win.locator('input[aria-label="Upload files"]').setInputFiles([
    {name:"SourceContent.TXT",mimeType:"text/plain",buffer:Buffer.from("Win7 data")},
    {name:"SourceKiB.bin",mimeType:"application/octet-stream",buffer:Buffer.alloc(2048,0x41)}
  ]);
  const file=win.locator('[data-test-explorer-item="SourceContent.TXT"]');
  await expect(file).toBeVisible();
  await setSourceView(win,"Content");
  const extras=file.locator('[data-test-source-content-extras] .listview__item-extra');
  await expect(extras).toHaveCount(3);
  await expect(extras.nth(0)).not.toHaveText("TXT File");
  await expect(extras.nth(1)).toHaveText("TXT File");
  await expect(extras.nth(2)).toHaveText("9 bytes");
  const larger=win.locator('[data-test-explorer-item="SourceKiB.bin"]');
  await expect(larger.locator('[data-test-source-content-extras] .listview__item-extra').nth(2))
    .toHaveText("2.0 KB");
  await file.click();
  await expect(file).toHaveClass(/is-selected/);
});

test("source search Content location resolves actual mounted C: rather than internal Guest URI",async({page})=>{
  const win=await openComputer(page);
  await win.getByRole("button",{name:"System (C:)",exact:true}).click();
  await win.locator('input[aria-label="Upload files"]').setInputFiles({
    name:"SourceLocationCheck.txt",mimeType:"text/plain",buffer:Buffer.from("location")
  });
  await expect(win.locator('[data-test-explorer-item="SourceLocationCheck.txt"]')).toBeVisible();
  await setSourceView(win,"Content");
  await win.getByRole("searchbox",{name:"Search files"}).fill("SourceLocationCheck");
  await expect(win.getByText("1 found",{exact:true})).toBeVisible();
  const extras=win.locator('[data-test-explorer-item="SourceLocationCheck.txt"]')
    .locator('[data-test-source-content-extras] .listview__item-extra');
  await expect(extras).toHaveCount(3);
  await expect(extras.nth(0)).toContainText("Date modified:");
  await expect(extras.nth(1)).toHaveText("C:\\");
  await expect(extras.nth(2)).toHaveText("Size: 8 bytes");
});

test("pinned source List/Content CSS geometry applies to Win7 and adapts to mobile",async({page},testInfo)=>{
  const win=await openComputer(page);
  await win.getByRole("button",{name:"New folder"}).click();
  const prompt=win.getByRole("dialog",{name:"New folder"});
  await prompt.getByRole("textbox",{name:"New folder name"}).fill("SourceGeometry");
  await prompt.getByRole("button",{name:"OK"}).click();
  await setSourceView(win,"List");
  const list=win.locator('[data-test-source-listview="list"]');
  const item=list.locator('[data-test-explorer-item="SourceGeometry"]');
  await expect(item).toBeVisible();
  const listSizes=await item.evaluate(element=>{
    const row=getComputedStyle(element);
    const icon=getComputedStyle(element.querySelector(".listview__item-iconbox")!);
    return {width:element.getBoundingClientRect().width,minWidth:row.minWidth,iconWidth:icon.width};
  });
  await expect.poll(async()=>list.locator(".explorer-item").count()).toBeGreaterThan(0);
  expect(listSizes.iconWidth).toBe("16px");
  if(testInfo.project.name.toLowerCase().includes("mobile") ||
     (await page.viewportSize())!.width<=580){
    expect(listSizes.minWidth).toBe("0px");
  }else{
    expect(listSizes.minWidth).toBe("300px");
    expect(listSizes.width).toBeGreaterThanOrEqual(300);
  }
  await setSourceView(win,"Content");
  const content=win.locator('[data-test-source-listview="content"]');
  const info=content.locator('[data-test-explorer-item="SourceGeometry"] .listview__item-info');
  await expect(info).toBeVisible();
  expect(await info.evaluate(element=>getComputedStyle(element).gap)).toBe("6px");
  expect(await content.locator(".listview__item-iconbox").first()
    .evaluate(element=>getComputedStyle(element).width)).toBe("48px");
});
