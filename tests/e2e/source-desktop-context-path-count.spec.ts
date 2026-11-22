import {expect,test,type Page} from "@playwright/test";
import {zipSync} from "fflate";

const DESKTOP="/EXTERNAL/computer/drive0/Users/Guest/Desktop";

/**
 * Frozen legacy-win7 src/modules/system/main.js DesktopItemMenu:
 * watcher maps selected icon ids to actual shortcut.path values, then
 * isMultiple() returns this.paths.length > 1. System/program-only icons
 * have no Guest path and never inflate that multiple predicate.
 */
async function login(page:Page){
  await page.goto("/?theme=win7");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await expect(page.locator("#desktop-icons")).toBeVisible();
}
const icon=(page:Page,name:string)=>page.locator(
  '[data-test-desktop-file="'+DESKTOP+"/"+name+'"]'
);

test("selected Computer plus one real ZIP preserves source single-item Open, Rename and Extract here",async({page})=>{
  await login(page);
  const archive=Buffer.from(zipSync({
    "Inside.txt":new TextEncoder().encode("single source path after system selection")
  }));
  await page.locator('[data-test-desktop-upload-input]').setInputFiles({
    name:"Only Archive.zip",mimeType:"application/zip",buffer:archive
  });
  const zip=icon(page,"Only Archive.zip");
  await expect(zip).toBeVisible();
  await zip.click();
  await page.locator('[data-test-desktop-icon="computer"]')
    .click({modifiers:["Control"]});
  await expect(zip).toHaveAttribute("data-test-desktop-selected","true");
  await expect(page.locator('[data-test-desktop-icon="computer"]'))
    .toHaveAttribute("data-test-desktop-selected","true");
  await zip.click({button:"right"});
  const menu=page.locator("[data-test-desktop-menu]");
  await expect(menu.locator('[data-test-desktop-item-action="open"]')).toBeVisible();
  await expect(menu.locator('[data-test-desktop-item-action="rename"]')).toBeVisible();
  const extract=menu.locator('[data-test-desktop-item-action="extract-here"]');
  await expect(extract).toBeEnabled();
  await extract.click();
  await expect(icon(page,"Inside.txt")).toBeVisible();
  await expect(zip).toBeVisible();
});

test("two real Guest files plus a system icon still hide single-item actions",async({page})=>{
  await login(page);
  await page.locator('[data-test-desktop-upload-input]').setInputFiles([
    {name:"First Data.txt",mimeType:"text/plain",buffer:Buffer.from("first")},
    {name:"Second Data.bin",mimeType:"application/octet-stream",buffer:Buffer.from([0,255,7])}
  ]);
  const first=icon(page,"First Data.txt"),second=icon(page,"Second Data.bin");
  await expect(first).toBeVisible();
  await expect(second).toBeVisible();
  await first.click();
  await second.click({modifiers:["Control"]});
  await page.locator('[data-test-desktop-icon="computer"]')
    .click({modifiers:["Control"]});
  await first.click({button:"right"});
  const menu=page.locator("[data-test-desktop-menu]");
  await expect(menu.locator('[data-test-desktop-item-action="open"]')).toHaveCount(0);
  await expect(menu.locator('[data-test-desktop-item-action="rename"]')).toHaveCount(0);
  await expect(menu.locator('[data-test-desktop-item-action="download"]')).toBeEnabled();
  await expect(menu.locator('[data-test-desktop-item-action="copy"]')).toBeEnabled();
});

test("program-only .lnk plus one Guest file counts one source path, not two highlighted icons",async({page})=>{
  await login(page);
  await page.locator('[data-test-desktop-upload-input]').setInputFiles([
    {name:"Actual Data.txt",mimeType:"text/plain",buffer:Buffer.from("real")},
    {name:"No Guest Path.lnk",mimeType:"application/json",
      buffer:Buffer.from('{"exe":"calc","icon":"calc"}')}
  ]);
  const real=icon(page,"Actual Data.txt"),link=icon(page,"No Guest Path.lnk");
  await expect(real).toBeVisible();
  await expect(link).toBeVisible();
  await real.click();
  await link.click({modifiers:["Control"]});
  await link.click({button:"right"});
  const menu=page.locator("[data-test-desktop-menu]");
  await expect(menu.locator('[data-test-desktop-item-action="open"]')).toBeVisible();
  await expect(menu.locator('[data-test-desktop-item-action="rename"]')).toBeVisible();
  await expect(menu.locator('[data-test-desktop-item-action="copy"]')).toBeEnabled();
});
