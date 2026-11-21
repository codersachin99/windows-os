import {expect,test,type Page} from "@playwright/test";
async function openSnipping(page:Page){
  await page.goto("/?theme=win7");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.getByRole("button",{name:"Open Start menu"}).click();
  await page.locator('[data-test-program="snipping"]').click();
  const app=page.locator('[data-test-window="snipping"]');
  await expect(app).toBeVisible();
  return app;
}
test("Snipping Tool retains source New menu and cancel behavior",async({page})=>{
  const app=await openSnipping(page);
  await expect(app.locator('[data-test-snipping-result]')).toContainText("Select a snip");
  await app.getByRole("button",{name:"New snip"}).click();
  const menu=app.getByRole("menu");
  await expect(menu.getByRole("menuitem",{name:"Free-form Snip"})).toBeDisabled();
  await expect(menu.getByRole("menuitem",{name:"Rectangular Snip"})).toBeEnabled();
  await expect(menu.getByRole("menuitem",{name:"Window Snip"})).toBeEnabled();
  await expect(menu.getByRole("menuitem",{name:"Full-screen Snip"})).toBeEnabled();
  await menu.getByRole("menuitem",{name:"Rectangular Snip"}).click();
  await expect(page.locator('[data-test-snipping-overlay]')).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator('[data-test-snipping-overlay]')).toHaveCount(0);
  await expect(app.locator('[data-test-snipping-result]')).toContainText("Select a snip");
});
test("rectangular snip captures real pixels and stores original PNG in Guest VFS",async({page})=>{
  const app=await openSnipping(page);
  await app.getByRole("button",{name:"New snip"}).click();
  await app.getByRole("menuitem",{name:"Rectangular Snip"}).click();
  const overlay=page.locator('[data-test-snipping-overlay]');
  await expect(overlay).toBeVisible();
  await page.mouse.move(30,140);
  await page.mouse.down();await page.mouse.move(180,260,{steps:4});await page.mouse.up();
  const image=app.locator('[data-test-snipping-image]');
  await expect(image).toBeVisible({timeout:18000});
  const size=await image.evaluate(async(node:HTMLImageElement)=>{
    await node.decode();return {width:node.naturalWidth,height:node.naturalHeight};
  });
  expect(size).toEqual({width:150,height:120});
  // A valid image header alone is not enough: at least one live desktop pixel
  // must have been painted into the screenshot (not a fabricated empty canvas).
  const alpha=await image.evaluate((img:HTMLImageElement)=>{
    const canvas=document.createElement("canvas");
    canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;
    const ctx=canvas.getContext("2d");if(!ctx)return 0;
    ctx.drawImage(img,0,0);
    const data=ctx.getImageData(0,0,canvas.width,canvas.height).data;
    let visible=0;for(let i=3;i<data.length;i+=4)if(data[i]!==0)visible++;
    return visible;
  });
  expect(alpha).toBeGreaterThan(100);

  await app.getByRole("button",{name:"Save",exact:true}).click();
  const dialog=page.locator('[data-test-snipping-save-dialog] [data-test-file-dialog="save"]');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel("Save as type:")).toHaveValue("png");
  await dialog.getByLabel("File name:").fill("SourceSnipPNG");
  await dialog.getByRole("button",{name:"Save",exact:true}).click();
  await expect(dialog).toHaveCount(0);
  const stored=await page.evaluate(()=>{
    const value=localStorage.getItem("windows-os:vfs:guest:v1");
    return value?(JSON.parse(value) as {entries:Array<{uri:string;bytes?:string}>})
      .entries.find(e=>e.uri==="/SourceSnipPNG.png")?.bytes:null;
  });
  expect(stored).toBeTruthy();
  const bytes=Buffer.from(stored!,"base64");
  expect([...bytes.subarray(0,8)]).toEqual([137,80,78,71,13,10,26,10]);
});
test("full-screen snip can Save As a genuine JPEG",async({page})=>{
  const app=await openSnipping(page);
  await app.getByRole("button",{name:"New snip"}).click();
  await app.getByRole("menuitem",{name:"Full-screen Snip"}).click();
  const image=app.locator('[data-test-snipping-image]');
  await expect(image).toBeVisible({timeout:18000});
  await app.getByRole("button",{name:"Save",exact:true}).click();
  const dialog=page.locator('[data-test-snipping-save-dialog] [data-test-file-dialog="save"]');
  await dialog.getByLabel("Save as type:").selectOption("jpg");
  await dialog.getByLabel("File name:").fill("SourceSnipJPEG");
  await dialog.getByRole("button",{name:"Save",exact:true}).click();
  await expect(dialog).toHaveCount(0);
  const saved=await page.evaluate(()=>{
    const value=localStorage.getItem("windows-os:vfs:guest:v1");
    return value?(JSON.parse(value) as {entries:Array<{uri:string;bytes?:string}>})
      .entries.find(e=>e.uri==="/SourceSnipJPEG.jpg")?.bytes:null;
  });
  expect(saved).toBeTruthy();
  const bytes=Buffer.from(saved!,"base64");
  expect([...bytes.subarray(0,2)]).toEqual([0xff,0xd8]);
  expect([...bytes.subarray(-2)]).toEqual([0xff,0xd9]);
});
