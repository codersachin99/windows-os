import { expect, test, type Page, type Locator } from "@playwright/test";

const desktop="/EXTERNAL/computer/drive0/Users/Guest/Desktop";
const guestStoreKey="windows-os:vfs:guest:v1";

async function login(page:Page) {
  await page.goto("/");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await expect(page.locator("#desktop-icons")).toBeVisible();
}
async function explorer(page:Page):Promise<Locator> {
  await login(page);
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const window=page.locator('[data-test-window="computer"]').last();
  await expect(window).toBeVisible();
  return window;
}
async function monitorGuestWrites(page:Page) {
  await page.evaluate(() => {
    const host=window as Window & { __guestUploadFail?:boolean; __guestUploadWrites?:number };
    host.__guestUploadFail=false;
    host.__guestUploadWrites=0;
    const original=Storage.prototype.setItem;
    Storage.prototype.setItem=function(key:string,value:string) {
      if(key==="windows-os:vfs:guest:v1") {
        host.__guestUploadWrites=(host.__guestUploadWrites ?? 0)+1;
        if(host.__guestUploadFail) throw new Error("QuotaExceededError: simulated");
      }
      return original.call(this,key,value);
    };
  });
}
async function countWrites(page:Page) {
  return page.evaluate(() =>
    (window as Window & {__guestUploadWrites?:number}).__guestUploadWrites ?? 0);
}

test("Explorer multi-file Upload stores mixed UTF-8 and binary in one persistent snapshot",async({page})=>{
  const win=await explorer(page);
  await monitorGuestWrites(page);
  await win.locator('input[type="file"][aria-label="Upload files"]').setInputFiles([
    {name:"Import Two.txt",mimeType:"text/plain",buffer:Buffer.from("Imported hello 😀")},
    {name:"Import Two.bin",mimeType:"application/octet-stream",buffer:Buffer.from([0,12,255,1])}
  ]);
  await expect(win.locator('[data-test-explorer-item="Import Two.txt"]')).toBeVisible();
  await expect(win.locator('[data-test-explorer-item="Import Two.bin"]')).toBeVisible();
  expect(await countWrites(page)).toBe(1);
  const result=await page.evaluate(key=>{
    const data=JSON.parse(localStorage.getItem(key)!) as {
      entries:{uri:string;content?:string;bytes?:string}[]
    };
    const txt=data.entries.find(item=>item.uri==="/Import Two.txt");
    const bin=data.entries.find(item=>item.uri==="/Import Two.bin");
    return {
      text:txt?.content,
      binary:bin?.bytes ? [...atob(bin.bytes)].map(char=>char.charCodeAt(0)):null
    };
  },guestStoreKey);
  expect(result).toEqual({text:"Imported hello 😀",binary:[0,12,255,1]});
  await page.reload();
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const restored=page.locator('[data-test-window="computer"]').last();
  await expect(restored.locator('[data-test-explorer-item="Import Two.txt"]')).toBeVisible();
  await expect(restored.locator('[data-test-explorer-item="Import Two.bin"]')).toBeVisible();
});

test("Explorer Upload quota failure leaves both files absent then retry imports whole selection",async({page})=>{
  const win=await explorer(page);
  await monitorGuestWrites(page);
  await page.evaluate(() => {
    (window as Window & {__guestUploadFail?:boolean}).__guestUploadFail=true;
  });
  const input=win.locator('input[type="file"][aria-label="Upload files"]');
  const files=[
    {name:"Atomic Failure.txt",mimeType:"text/plain",buffer:Buffer.from("never partial")},
    {name:"Atomic Failure.bin",mimeType:"application/octet-stream",buffer:Buffer.from([255,0])}
  ];
  await input.setInputFiles(files);
  await expect(win.getByRole("alert")).toContainText("QuotaExceededError");
  await expect(win.locator('[data-test-explorer-item="Atomic Failure.txt"]')).toHaveCount(0);
  await expect(win.locator('[data-test-explorer-item="Atomic Failure.bin"]')).toHaveCount(0);
  const snapshot=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!) as {
    entries:{uri:string}[]
  },guestStoreKey);
  expect(snapshot.entries.some(entry=>entry.uri.startsWith("/Atomic Failure."))).toBe(false);
  expect(await countWrites(page)).toBe(1);
  await page.evaluate(() => {
    (window as Window & {__guestUploadFail?:boolean}).__guestUploadFail=false;
  });
  await input.setInputFiles(files);
  await expect(win.locator('[data-test-explorer-item="Atomic Failure.txt"]')).toBeVisible();
  await expect(win.locator('[data-test-explorer-item="Atomic Failure.bin"]')).toBeVisible();
  expect(await countWrites(page)).toBe(2);
});

test("native Desktop external File drop imports a mixed selection atomically",async({page})=>{
  await login(page);
  await monitorGuestWrites(page);
  await page.evaluate(() => {
    const target=document.querySelector("#desktop-icons");
    if(!target)throw Error("Desktop not mounted");
    const data=new DataTransfer();
    data.items.add(new File(["Desktop unicode 😀"],"Batch Desktop.txt",{type:"text/plain"}));
    data.items.add(new File([new Uint8Array([255,128,0])],"Batch Desktop.bin"));
    target.dispatchEvent(new DragEvent("dragover",{bubbles:true,cancelable:true,dataTransfer:data}));
    target.dispatchEvent(new DragEvent("drop",{bubbles:true,cancelable:true,dataTransfer:data}));
  });
  await expect(page.locator('[data-test-desktop-file="'+desktop+'/Batch Desktop.txt"]')).toBeVisible();
  await expect(page.locator('[data-test-desktop-file="'+desktop+'/Batch Desktop.bin"]')).toBeVisible();
  expect(await countWrites(page)).toBe(1);
  const persisted=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!) as {
    entries:{uri:string;content?:string;bytes?:string}[]
  },guestStoreKey);
  expect(persisted.entries.find(item=>item.uri===desktop+"/Batch Desktop.txt")?.content)
    .toBe("Desktop unicode 😀");
  expect([...atob(persisted.entries.find(item=>item.uri===desktop+"/Batch Desktop.bin")?.bytes ?? "")]
    .map(char=>char.charCodeAt(0))).toEqual([255,128,0]);
});
