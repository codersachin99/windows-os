import { describe, expect, it, vi } from "vitest";
import { contactInitials, createContactsApi, filterContacts, validDraft, type Contact } from "./api";

const sample: Contact = {
  id: "1", name: "Bill Gates", email: "bill.gates@microsoft.com",
  phone: "+1 425 882 8080", company: "Microsoft Corporation", notes: "Technology Advisor"
};

function reply(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status, headers: { "Content-Type": "application/json" }
  });
}

describe("Contacts: source-equivalent view model and REST contract", () => {
  it("filters name, email, phone and company, but not notes", () => {
    expect(filterContacts([sample], "  mIcRoSoFt ")).toEqual([sample]);
    expect(filterContacts([sample], "425 882")).toEqual([sample]);
    expect(filterContacts([sample], "bill.gates@")).toEqual([sample]);
    expect(filterContacts([sample], "Technology Advisor")).toEqual([]);
    expect(contactInitials("Bill Gates")).toBe("BI");
  });

  it("trims the same five original form fields and requires a name", () => {
    const contact = validDraft({ name: " Bill Gates ", email: " x@y.com ", phone: "  123  ",
      company: " Example ", notes: " note ", id: "1" });
    expect(contact).toEqual({ id: "1", name: "Bill Gates", email: "x@y.com",
      phone: "123", company: "Example", notes: "note" });
    expect(() => validDraft({ name: "  ", email: "", phone: "", company: "", notes: "" }))
      .toThrow("Please enter a name");
  });

  it("GET /api/contacts consumes the unchanged legacy list format", async () => {
    const request = vi.fn(async () => reply([sample]));
    const contacts = await createContactsApi(request as unknown as typeof fetch).list();
    expect(contacts).toEqual([sample]);
    expect(request).toHaveBeenCalledWith("/api/contacts", { signal: undefined });
  });

  it("POST save wraps the contact in the original request body", async () => {
    const request = vi.fn(async () => reply({ success: true, contact: sample, contacts: [sample] }));
    const returned = await createContactsApi(request as unknown as typeof fetch)
      .save({ ...sample, name: " Bill Gates " });
    expect(returned).toEqual(sample);
    expect(request).toHaveBeenCalledWith("/api/contacts/save", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contact: sample })
    });
  });

  it("POST delete sends the id and checks the server's success response", async () => {
    const request = vi.fn(async () => reply({ success: true, contacts: [] }));
    await createContactsApi(request as unknown as typeof fetch).delete("1");
    expect(request).toHaveBeenCalledWith("/api/contacts/delete", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "1" })
    });
  });

  it("propagates HTTP and API errors; never treats a failure as saved", async () => {
    const request = vi.fn(async () => reply({ error: "Database unavailable" }, 503));
    const api = createContactsApi(request as unknown as typeof fetch);
    await expect(api.list()).rejects.toThrow("Database unavailable");
    await expect(api.delete("1")).rejects.toThrow("Database unavailable");
  });
});
