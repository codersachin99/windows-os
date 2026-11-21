import { expect, test } from "@playwright/test";

for (const app of ["computer", "bin"] as const) {
  test(`original Win7 ${app} shows disabled Save search only in search results`, async ({page}) => {
    await page.goto("/?theme=win7");
    await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
    await page.locator('[data-test-desktop-icon="' + app + '"]').dblclick();
    const explorer=page.locator('[data-test-window="' + app + '"]');
    const save=explorer.getByRole("button",{name:"Save search",exact:true});
    await expect(save).toHaveCount(0);

    const search=explorer.getByRole("searchbox",{name:"Search files"});
    await search.fill("DefinitelyAbsentSourceSaveSearchProbe");
    await expect(explorer.getByText("0 found",{exact:true})).toBeVisible();
    await expect(save).toBeVisible();
    await expect(save).toBeDisabled();

    await search.fill("");
    await expect(save).toHaveCount(0);
    await expect(explorer.getByText("0 found",{exact:true})).toHaveCount(0);
  });
}
