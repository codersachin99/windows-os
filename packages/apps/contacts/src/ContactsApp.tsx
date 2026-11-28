import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import styles from "./source.css?raw";
import { contactsApi, contactInitials, filterContacts, type Contact, type ContactDraft } from "./api";

const blank: ContactDraft = { name: "", email: "", phone: "", company: "", notes: "" };

function Icon({ name }: { name: "new" | "edit" | "delete" | "refresh" | "search" }) {
  const paths = {
    new: "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
    edit: "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z",
    delete: "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z",
    refresh: "M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z",
    search: "M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
  } as const;
  return <svg width={name === "search" ? 12 : 14} height={name === "search" ? 12 : 14}
    viewBox="0 0 24 24" fill={name === "delete" ? "#c53030" : name === "search" ? "#718096" : "#2b6cb0"}
    aria-hidden="true"><path d={paths[name]} /></svg>;
}

function ContactsBody() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<ContactDraft | null>(null);
  const [status, setStatus] = useState("Ready");
  const [busy, setBusy] = useState(false);
  const nameField = useRef<HTMLInputElement>(null);
  const selected = contacts.find(contact => contact.id === selectedId);
  const visible = filterContacts(contacts, search);

  const refresh = useCallback(async (signal?: AbortSignal) => {
    setStatus("Loading contacts...");
    try {
      const list = await contactsApi.list(signal);
      if (signal?.aborted) return;
      setContacts(list);
      setSelectedId(current => current && !list.some(contact => contact.id === current) ? null : current);
      setStatus(`${list.length} contact(s) loaded`);
    } catch (error) {
      if (signal?.aborted) return;
      setStatus(error instanceof Error ? `Error loading contacts: ${error.message}` : "Error loading contacts");
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void refresh(controller.signal);
    return () => controller.abort();
  }, [refresh]);

  useEffect(() => {
    if (form) nameField.current?.focus();
  }, [form !== null]);

  const open = (contact?: Contact) => setForm(contact ? { ...contact } : { ...blank });
  const update = (name: keyof ContactDraft, value: string) => {
    setForm(current => current ? { ...current, [name]: value } : current);
  };
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form || busy) return;
    if (!form.name.trim()) {
      window.alert("Please enter a name for the contact.");
      return;
    }
    setBusy(true);
    setStatus("Saving contact...");
    try {
      const saved = await contactsApi.save(form);
      setForm(null);
      await refresh();
      setSelectedId(saved.id);
      setStatus("Contact saved successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setStatus(`Failed to save contact: ${message}`);
      window.alert(`Failed to save: ${message}`);
    } finally {
      setBusy(false);
    }
  };
  const remove = async () => {
    if (!selected || busy || !window.confirm(`Are you sure you want to delete ${selected.name}?`)) return;
    setBusy(true);
    setStatus("Deleting contact...");
    try {
      await contactsApi.delete(selected.id);
      setSelectedId(null);
      await refresh();
      setStatus("Contact deleted");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setStatus(`Failed to delete contact: ${message}`);
      window.alert(`Failed to delete contact: ${message}`);
    } finally {
      setBusy(false);
    }
  };

  const rows: { field: keyof ContactDraft; label: string; placeholder: string; multiline?: boolean }[] = [
    { field: "name", label: "Full Name *", placeholder: "e.g. Alexander Graham" },
    { field: "email", label: "E-mail Address", placeholder: "e.g. alexander@example.com" },
    { field: "phone", label: "Phone Number", placeholder: "e.g. +1 (555) 019-2834" },
    { field: "company", label: "Company / Title", placeholder: "e.g. Contoso Ltd. / Analyst" },
    { field: "notes", label: "Notes", placeholder: "Optional notes...", multiline: true }
  ];

  return <div className="contacts-stage">
    <div className="app-container">
      <div className="command-bar">
        <button className="btn" id="btnNew" onClick={() => open()} disabled={busy}><Icon name="new" />New Contact</button>
        <button className="btn" id="btnEdit" onClick={() => selected && open(selected)} disabled={!selected || busy}><Icon name="edit" />Edit</button>
        <button className="btn btn-danger" id="btnDelete" onClick={() => void remove()} disabled={!selected || busy}><Icon name="delete" />Delete</button>
        <div className="separator" />
        <button className="btn" onClick={() => void refresh()} disabled={busy}><Icon name="refresh" />Refresh</button>
        <div className="search-box">
          <Icon name="search" />
          <input id="searchInput" type="text" placeholder="Search contacts..." value={search}
            onChange={event => setSearch(event.target.value)} />
        </div>
      </div>
      <div className="main-body">
        <div className="contact-list-panel">
          <div className="list-header"><span>Name</span><span id="contactCount">{visible.length} {visible.length === 1 ? "item" : "items"}</span></div>
          <ul className="contact-list" id="contactList">
            {visible.map(contact => <li key={contact.id} tabIndex={0} role="button"
              aria-label={contact.name} aria-pressed={selectedId === contact.id}
              className={`contact-item${selectedId === contact.id ? " active" : ""}`}
              onClick={() => setSelectedId(contact.id)}
              onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelectedId(contact.id); } }}>
              <div className="avatar-icon">{contactInitials(contact.name)}</div>
              <div className="contact-info-summary">
                <div className="summary-name">{contact.name || "Unnamed"}</div>
                <div className="summary-sub">{contact.company || contact.email || contact.phone}</div>
              </div>
            </li>)}
          </ul>
        </div>
        <div className="contact-detail-panel" id="detailPanel">
          {!selected ? <div className="empty-state" id="emptyState">
            <svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
            <div>Select a contact to view details</div>
          </div> : <div id="contactCard">
            <div className="card-header">
              <div className="card-avatar" id="cardAvatar">{contactInitials(selected.name)}</div>
              <div className="card-title">
                <h2 id="cardName">{selected.name}</h2>
                <p id="cardTitle">{selected.company || "No title specified"}</p>
              </div>
            </div>
            <div className="detail-grid">
              <div className="detail-label">Email:</div><div className="detail-value" id="cardEmail">{selected.email || "-"}</div>
              <div className="detail-label">Phone:</div><div className="detail-value" id="cardPhone">{selected.phone || "-"}</div>
              <div className="detail-label">Company:</div><div className="detail-value" id="cardCompany">{selected.company || "-"}</div>
              <div className="detail-label">Notes:</div><div className="detail-value" id="cardNotes" style={{ whiteSpace: "pre-wrap" }}>{selected.notes || "-"}</div>
            </div>
          </div>}
        </div>
      </div>
      <div className="status-bar" id="statusBar" role="status">{status}</div>
    </div>
    {form && <div className="modal-overlay" id="contactModal" style={{ display: "flex" }}>
      <form className="modal-dialog" onSubmit={event => void save(event)}>
        <div className="modal-titlebar">
          <span id="modalTitle">{form.id ? "Edit Contact" : "New Contact"}</span>
          <button type="button" className="close-btn" aria-label="Close contact dialog"
            onClick={() => setForm(null)} disabled={busy}>×</button>
        </div>
        <div className="modal-body">
          {rows.map(({ field, label, placeholder, multiline }) => <div className="form-group" key={field}>
            <label htmlFor={`input-${field}`}>{label}</label>
            {multiline
              ? <textarea id={`input-${field}`} rows={3} placeholder={placeholder} value={form[field] ?? ""}
                  onChange={event => update(field, event.target.value)} />
              : <input id={`input-${field}`} type={field === "email" ? "email" : "text"}
                  ref={field === "name" ? nameField : undefined} required={field === "name"}
                  placeholder={placeholder} value={form[field] ?? ""}
                  onChange={event => update(field, event.target.value)} />}
          </div>)}
        </div>
        <div className="modal-footer">
          <button className="btn" style={{ minWidth: 70 }} type="submit" disabled={busy}>Save</button>
          <button className="btn" style={{ minWidth: 70 }} type="button" disabled={busy}
            onClick={() => setForm(null)}>Cancel</button>
        </div>
      </form>
    </div>}
  </div>;
}

export function ContactsApp() {
  const host = useRef<HTMLDivElement>(null);
  const [shadow, setShadow] = useState<ShadowRoot | null>(null);
  useEffect(() => {
    const element = host.current;
    if (element) setShadow(element.shadowRoot ?? element.attachShadow({ mode: "open" }));
  }, []);
  const shellStyle = `
    :host { display: block; width: 100%; height: 100%; overflow: hidden; background: #f0f0f0; color: #1e395b; }
    .contacts-stage { position: relative; width: 100%; height: 100%; overflow: hidden; }
    .modal-overlay { position: absolute !important; }
  `;
  return <div ref={host} className="windows-contacts-host" style={{ width: "100%", height: "100%" }}>
    {shadow && createPortal(<><style>{styles + shellStyle}</style><ContactsBody /></>, shadow)}
  </div>;
}
