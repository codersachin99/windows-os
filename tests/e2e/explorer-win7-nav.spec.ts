import { expect, test } from "@playwright/test";

test("Win7 Computer keeps exact four-row history sprite and functional Back/Forward", async ({ page }) => {
  await page.goto("/?theme=win7");
  await page.locator('[data-test-avatar="win7"]').click({ timeout: 12000 });
  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const explorer = page.locator('[data-test-window="computer"]');
  const nav = explorer.getByRole("navigation", { name: "Folder history" });
  const back = nav.getByRole("button", { name: "Back" });
  const forward = nav.getByRole("button", { name: "Forward" });
  await expect(nav).toBeVisible();
  await expect(back).toBeDisabled();
  await expect(forward).toBeDisabled();
  const readSprite = async () => back.evaluate(element => {
    const styles = getComputedStyle(element);
    return {
      image: styles.backgroundImage, size: styles.backgroundSize,
      position: styles.backgroundPositionY, width: element.getBoundingClientRect().width
    };
  });
  const disabled = await readSprite();
  expect(disabled.image).toContain("data:image/webp;base64,");
  expect(disabled.size).toBe("27px auto");
  expect(disabled.position).toBe("-81px");
  expect(disabled.width).toBe(27);
  await expect(forward).toHaveCSS("transform", "matrix(-1, 0, 0, 1, 0, 0)");

  await explorer.getByRole("button", { name: "New folder" }).click();
  const dialog = explorer.getByRole("dialog", { name: "New folder" });
  await dialog.getByRole("textbox", { name: "New folder name" }).fill("NavSourceProbe");
  await dialog.getByRole("button", { name: "OK" }).click();
  await explorer.locator('[data-test-explorer-item="NavSourceProbe"]').dblclick();
  await expect(back).toBeEnabled();
  await expect(back).toHaveCSS("background-position-y", "0px");
  await back.hover();
  await expect(back).toHaveCSS("background-position-y", "-27px");
  await back.click();
  await expect(explorer.getByRole("textbox", { name: "Folder address" })).toHaveValue("Computer");
  await expect(forward).toBeEnabled();
  await forward.click();
  await expect(explorer.getByRole("textbox", { name: "Folder address" })).toHaveValue("/NavSourceProbe");
});
