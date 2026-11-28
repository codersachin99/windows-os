import {expect,test} from "@playwright/test";

test("source listview-item 0616 preserves item type/key, active selection and safe name marks",async({page})=>{
  await page.goto("/?theme=win7");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const win=page.locator('[data-test-window="computer"]');
  await expect(win).toBeVisible();
  await win.getByRole("button",{name:"New folder"}).click();
  const prompt=win.getByRole("dialog",{name:"New folder"});
  await prompt.getByRole("textbox",{name:"New folder name"}).fill("SourceListItem");
  await prompt.getByRole("button",{name:"OK"}).click();
  const item=win.locator('[data-test-explorer-item="SourceListItem"]');
  await expect(item).toBeVisible();
  await expect(item).toHaveClass(/listview__item/);
  await expect(item).toHaveAttribute("data-key",/\/SourceListItem$/);
  await expect(item).toHaveAttribute("data-test-listview-item","directory");
  await expect(item).toHaveAttribute("title","SourceListItem");
  await item.click();
  await expect(item).toHaveClass(/is-active/);
  await expect(item).toHaveClass(/is-selected/);
  const search=win.getByRole("searchbox",{name:"Search files"});
  await search.fill("Source");
  await expect(item.locator(".listview__item-highlight")).toHaveText("Source");
  await expect(item.locator(".explorer-search-mark")).toHaveCount(1);
  await search.fill("");
  await item.dblclick();
  await expect(win.getByRole("textbox",{name:"Folder address"})).toHaveValue("/SourceListItem");
});
