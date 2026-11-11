import { expect, test } from "@playwright/test";

test("Contacts is a React app using original styling and API CRUD", async ({ page }) => {
  type Contact = { id: string; name: string; email: string; phone: string; company: string; notes: string };
  let contacts: Contact[] = [
    { id: "1", name: "Bill Gates", email: "bill.gates@microsoft.com",
      phone: "+1 425 882 8080", company: "Microsoft Corporation", notes: "Co-founder" }
  ];
  let lastSave: unknown = null;
  let lastDelete: unknown = null;

  await page.route("**" + "/api/contacts", async route => {
    expect(route.request().method()).toBe("GET");
    await route.fulfill({ json: contacts });
  });
  await page.route("**" + "/api/contacts/save", async route => {
    expect(route.request().method()).toBe("POST");
    const request = route.request().postDataJSON() as { contact: Contact };
    lastSave = request;
    const record = { ...request.contact, id: request.contact.id || "2" };
    contacts = contacts.filter(item => item.id !== record.id).concat(record);
    await route.fulfill({ json: { success: true, contact: record, contacts } });
  });
  await page.route("**" + "/api/contacts/delete", async route => {
    expect(route.request().method()).toBe("POST");
    const data = route.request().postDataJSON() as { id: string };
    lastDelete = data;
    contacts = contacts.filter(item => item.id !== data.id);
    await route.fulfill({ json: { success: true, contacts } });
  });

  await page.goto("/");
  await page.locator('[data-test-avatar="win7"]').click({ timeout: 12000 });
  await page.locator('[data-test-desktop-icon="web_contacts"]').dblclick();
  const win = page.locator('[data-test-window="web_contacts"]');
  await expect(win).toBeVisible();
  await expect(win.locator("iframe")).toHaveCount(0);
  await win.locator(".windows-window__titlebar").dblclick({ position: { x: 80, y: 10 } });
  await expect(win.locator(".windows-contacts-host .command-bar")).toBeVisible();
  await expect(win.getByText("Bill Gates")).toBeVisible();

  await win.getByRole("button", { name: "New Contact" }).click();
  await win.locator("#input-name").fill("  Ada Lovelace  ");
  await win.locator("#input-email").fill("ada@example.com");
  await win.locator("#input-company").fill("Analytical Engine");
  await win.locator("#input-notes").fill("  Programmer  ");
  await win.getByRole("button", { name: "Save" }).click();
  await expect(win.locator("#cardName")).toHaveText("Ada Lovelace");
  expect(lastSave).toEqual({ contact: {
    name: "Ada Lovelace", email: "ada@example.com",
    phone: "", company: "Analytical Engine", notes: "Programmer"
  } });

  await win.getByRole("button", { name: "Edit", exact: true }).click();
  await win.locator("#input-company").fill("Mathematics");
  await win.getByRole("button", { name: "Save" }).click();
  await expect(win.locator("#cardCompany")).toHaveText("Mathematics");

  await win.locator("#searchInput").fill("mathematics");
  await expect(win.locator("#contactCount")).toHaveText("1 item");
  await win.locator("#searchInput").fill("");

  page.once("dialog", dialog => dialog.accept());
  await win.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(win.locator("#cardName")).toHaveCount(0);
  await expect(win.getByText("Ada Lovelace")).toHaveCount(0);
  expect(lastDelete).toEqual({ id: "2" });
});

test("Contacts surfaces backend failure rather than fabricating data", async ({ page }) => {
  await page.route("**" + "/api/contacts", route => route.fulfill({
    status: 503, json: { error: "Database unavailable" }
  }));
  await page.goto("/");
  await page.locator('[data-test-avatar="win7"]').click({ timeout: 12000 });
  await page.locator('[data-test-desktop-icon="web_contacts"]').dblclick();
  const win = page.locator('[data-test-window="web_contacts"]');
  await expect(win.getByText("Error loading contacts: Database unavailable")).toBeVisible();
  await expect(win.locator("#contactCount")).toHaveText("0 items");
});
