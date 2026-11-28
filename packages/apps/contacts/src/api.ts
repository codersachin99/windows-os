export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  notes: string;
}

export type ContactDraft = Omit<Contact, "id"> & { id?: string };

export function filterContacts(contacts: readonly Contact[], text: string): Contact[] {
  const query = text.toLocaleLowerCase().trim();
  if (!query) return [...contacts];
  return contacts.filter(contact => [contact.name, contact.email, contact.phone, contact.company]
    .some(field => field.toLocaleLowerCase().includes(query)));
}

export function contactInitials(name: string): string {
  return (name || "?").substring(0, 2).toLocaleUpperCase();
}

export function validDraft(draft: ContactDraft): ContactDraft {
  const sanitized = {
    id: draft.id || undefined,
    name: draft.name.trim(),
    email: draft.email.trim(),
    phone: draft.phone.trim(),
    company: draft.company.trim(),
    notes: draft.notes.trim()
  };
  if (!sanitized.name) throw new Error("Please enter a name for the contact.");
  return sanitized;
}

function parseContact(value: unknown): Contact {
  if (!value || typeof value !== "object") throw new Error("Invalid contact returned by the server");
  const contact = value as Record<string, unknown>;
  if (contact.id == null || typeof contact.name !== "string") {
    throw new Error("Invalid contact identifier or name");
  }
  const get = (field: keyof Contact): string => String(contact[field] ?? "");
  return {
    id: String(contact.id), name: contact.name,
    email: get("email"), phone: get("phone"),
    company: get("company"), notes: get("notes")
  };
}

async function jsonResponse(response: Response): Promise<unknown> {
  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new Error(`Contacts API returned invalid JSON (HTTP ${response.status})`);
  }
  const error = (data && typeof data === "object" ? (data as Record<string, unknown>).error : null);
  if (!response.ok || error) {
    throw new Error(typeof error === "string" ? error : `Contacts API HTTP ${response.status}`);
  }
  return data;
}

export function createContactsApi(request: typeof fetch = fetch) {
  return {
    async list(signal?: AbortSignal): Promise<Contact[]> {
      const response = await request("/api/contacts", { signal });
      const body = await jsonResponse(response);
      if (!Array.isArray(body)) throw new Error("Contacts API did not return a list");
      return body.map(parseContact);
    },
    async save(draft: ContactDraft): Promise<Contact> {
      const contact = validDraft(draft);
      const response = await request("/api/contacts/save", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact })
      });
      const body = await jsonResponse(response) as { success?: boolean; contact?: unknown };
      if (!body || body.success !== true || !body.contact) {
        throw new Error("Contact save was not confirmed by the server");
      }
      return parseContact(body.contact);
    },
    async delete(id: string): Promise<void> {
      if (!id) throw new Error("Contact ID required");
      const response = await request("/api/contacts/delete", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const body = await jsonResponse(response) as { success?: boolean };
      if (!body || body.success !== true) throw new Error("Contact deletion was not confirmed by the server");
    }
  };
}

export const contactsApi = createContactsApi();
