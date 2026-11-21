"""Contact Model handling CRUD operations on contacts table."""

import time
from typing import Any, Dict, List, Optional
try:
    from models.base_model import BaseModel
    from database.db_client import db
except ImportError:
    from .base_model import BaseModel
    from ..database.db_client import db


class ContactModel(BaseModel):
    table_name: str = "contacts"
    primary_key: str = "id"

    @classmethod
    def init_table(cls):
        """Ensures the contacts table exists."""
        query = """
            CREATE TABLE IF NOT EXISTS contacts (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT,
                phone TEXT,
                company TEXT,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """
        db.execute(query)

    @classmethod
    def get_all(cls) -> List[Dict[str, Any]]:
        cls.init_table()
        query = "SELECT id, name, email, phone, company, notes FROM contacts ORDER BY name ASC"
        return db.select_dict(query)

    @classmethod
    def get_by_id(cls, contact_id: str) -> Optional[Dict[str, Any]]:
        cls.init_table()
        query = "SELECT id, name, email, phone, company, notes FROM contacts WHERE id = ?"
        return db.select_one_dict(query, (str(contact_id),))

    @classmethod
    def save(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        cls.init_table()
        contact_id = str(data.get("id") or int(time.time() * 1000))
        name = data.get("name", "").strip() or "Unnamed"
        email = data.get("email", "").strip()
        phone = data.get("phone", "").strip()
        company = data.get("company", "").strip()
        notes = data.get("notes", "").strip()

        existing = cls.get_by_id(contact_id)
        if existing:
            query = """
                UPDATE contacts 
                SET name = ?, email = ?, phone = ?, company = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            """
            db.execute(query, (name, email, phone, company, notes, contact_id))
        else:
            query = """
                INSERT INTO contacts (id, name, email, phone, company, notes)
                VALUES (?, ?, ?, ?, ?, ?)
            """
            db.execute(query, (contact_id, name, email, phone, company, notes))

        return {
            "id": contact_id,
            "name": name,
            "email": email,
            "phone": phone,
            "company": company,
            "notes": notes
        }

    @classmethod
    def delete(cls, contact_id: str) -> bool:
        cls.init_table()
        return cls.delete_by_id(str(contact_id)) > 0
