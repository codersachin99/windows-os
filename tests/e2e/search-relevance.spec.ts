import { expect, test } from "@playwright/test";

test("pinned Computer relevance order, token boundary and filename highlight", async ({page}) => {
  await page.goto("/");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const explorer=page.locator('[data-test-window="computer"]');
  const create=async (name:string)=>{
    await explorer.getByRole("button",{name:"New folder"}).click();
    const dialog=explorer.getByRole("dialog",{name:"New folder"});
    await dialog.getByRole("textbox",{name:"New folder name"}).fill(name);
    await dialog.getByRole("button",{name:"OK"}).click();
    await expect(explorer.locator('[data-test-explorer-item="'+name+'"]')).toBeVisible();
  };
  await create("SearchRankingFixtures");
  await explorer.locator('[data-test-explorer-item="SearchRankingFixtures"]').dblclick();
  for (const name of ["Prereport","Annual-Report","Report-archive","Report"]) await create(name);
  await explorer.getByRole("searchbox",{name:"Search files"}).fill("report");
  await explorer.getByRole("button",{name:"Find files"}).click();
  const hits=explorer.locator('[data-test-explorer-item]');
  await expect(hits).toHaveCount(3);
  await expect(hits.first()).toHaveAttribute("data-test-explorer-item","Report");
  await expect(hits.nth(1)).toHaveAttribute("data-test-explorer-item","Report-archive");
  await expect(hits.nth(2)).toHaveAttribute("data-test-explorer-item","Annual-Report");
  await expect(hits.first().locator("mark.explorer-search-mark")).toHaveText("Report");
  await expect(explorer.locator('[data-test-explorer-item="Prereport"]')).toHaveCount(0);
  await expect(explorer.getByText("3 found",{exact:true})).toBeVisible();
});
